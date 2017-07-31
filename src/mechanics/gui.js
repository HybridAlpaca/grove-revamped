"use strict";

const G = require('globals'),
    $ = require('jquery');

export default class GUI {
    constructor(title, content) {
        $('#gui-title').text(title);
        $('#gui-content').html(content);
        $('#gui').fadeIn(400);
    }
}
