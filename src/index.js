'use strict';

const update = require('./init/loop'),
    init = require('./init/init');

window.addEventListener('load', () => {
    init();
    update();
});
