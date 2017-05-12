'use strict';

const THREE = require('three'),
    CANNON = require('cannon');

let $ = require('jquery'),
    globals = require('globals');

module.exports = () => {
    console._log = console.log;
    console._warn = console.warn;
    console._error = console.error;
    console.log = function() {
        var arr = [];
        for (var key in arguments) arr.push(arguments[key]);
        document.getElementById('console-logarea').innerHTML += '<p style="color:white;font-size:11px;text-indent:5px;"> \> ' + arr + '<\/p>';
        console._log(arr);
        $('#console-logarea').scrollTop(1e10);
    };
    console.warn = function() {
        var arr = [];
        for (var key in arguments)
            if (!/^.vertices\[/gi.test(arguments[key])) arr.push(arguments[key]);
        if (arr.length) document.getElementById('console-logarea').innerHTML += '<p style="color:yellow;font-size:11px;text-indent:5px;"> \> ' + arr + '<\/p>';
        if (arr.length) console._log(arr);
        $('#console-logarea').scrollTop(1e10);
    };
    console.error = function() {
        var arr = [];
        for (var key in arguments)
            if (!/right hand rule/gi.test(arguments[key])) arr.push(arguments[key]);
        if (arr.length) document.getElementById('console-logarea').innerHTML += '<p style="color:red;font-size:11px;text-indent:5px;"> \> ' + arr + '<\/p>';
        if (arr.length) console._error(arr);
        $('#console-logarea').scrollTop(1e10);
    };
    document.getElementById('console-input').addEventListener('keypress', function(e) {
        if (e.keyCode == 13) {
            try {
                let cmd = eval($('#console-input').val());
                if (['function', 'undefined', undefined, 'null'].indexOf(cmd) == -1) console.log(JSON.stringify(cmd));
            }
            catch (e) {
                console.error(e);
            }
            $('#console-input').val('');
        }
    });

    function handle_mousedown(e) {
        let my_dragging = {};
        my_dragging.pageX0 = e.pageX;
        my_dragging.pageY0 = e.pageY;
        my_dragging.elem = this;
        my_dragging.offset0 = $(this).offset();

        function handle_dragging(e) {
            let left = my_dragging.offset0.left + (e.pageX - my_dragging.pageX0);
            let top = my_dragging.offset0.top + (e.pageY - my_dragging.pageY0);
            $(my_dragging.elem)
                .offset({
                    top: top,
                    left: left
                });
        }

        function handle_mouseup(e) {
            $('body')
                .off('mousemove', handle_dragging)
                .off('mouseup', handle_mouseup);
        }
        $('body')
            .on('mouseup', handle_mouseup)
            .on('mousemove', handle_dragging);
    }
    $('#console').mousedown(handle_mousedown);

    $(document).on('keyup', (e) => {
        if (e.shiftKey && e.keyCode == 192) $('#console').toggle();
    });

};
