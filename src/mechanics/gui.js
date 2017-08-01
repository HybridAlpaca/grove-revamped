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
        let html = '';
        for (let item of data) {
            html += `<img src='${item.path}' title='${item.name}' width=50></img>`;
        }
        new GUI('Inventory', html);
    }
}

window.addEventListener('keypress', (e) => {
    if (e.keyCode == 73 || e.keyCode == 105)
        new Inventory();
});
