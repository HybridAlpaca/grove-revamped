"use strict";

const G = require('globals'),
    $ = require('jquery');

export default class GUI {
    constructor(title, content) {
        $('#gui-title').text(title);
        $('#gui-content').html(content);
        this.show();
        document.exitPointerLock();
    }

    show() {
        $('#gui').fadeIn(400);
    }

    hide() {
        $('#gui').fadeOut(400);
    }
}

export class Inventory {
    constructor() {
        let data = G.get('player').inv;
        let div = $('<div>');
        for (let item of data) {
            $('<img>')
                .attr('src', item.path)
                .attr('title', item.name)
                .attr('width', 50)
                .data('item', item)
                .appendTo(div);
        }
        div.on('click', 'img', function() {
            $(this).hide();
            if ($(this).data('item').effects)
                for (let key in $(this).data('item').effects) {
                    G.get('player')[key] += $(this).data('item').effects[key];
                }
            G.get('player').inv.splice(G.get('player').inv.indexOf($(this).data('item'), 1));
        });
        new GUI('Inventory', div);
    }
}

window.addEventListener('keypress', (e) => {
    if (e.keyCode == 73 || e.keyCode == 105)
        new Inventory();
});

$(document).keyup((e) => {
    if (e.key.toLowerCase() == 'escape') new GUI('Paused', 'The Grove is currently paused. :)');
});
