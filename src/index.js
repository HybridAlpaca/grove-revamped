'use strict';

/**
 * TODO: 
 * 
 * - Better AI's (2/3)
 *  ✓ add graphics
 *  ✓ add interaction (07/30/17)
 *  X add some resemblance of intelligence
 * 
 * - add questline
 * 
 * - GUI (1/3)
 *  ✓ inventory (07/31/17)
 *  X map
 *  X crafting
 * 
 * */


import {
    HUD
}
from './mechanics/gui';

let NPC = require('./entity').NPC;

new HUD();

window.onerror = alert; // use only in development

window.Grove.version = '1.3.7';
window.Grove.globals = require('globals');

Math.interval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
Array.prototype.has = function(data) {
    return this.indexOf(data) > -1;
};

console.log(`Starting The Grove v.${window.Grove.version} pre-alpha`);

let Wicket = window.wicket = new NPC('wicket', {
    pos: {},
    sounds: ['wicket.mp3', null, 'wicket-hurt.mp3', 'wicket-hurt.mp3']
});

require('./init/world')();
require('./init/scene')();
require('./init/update')();
require('./potions');
require('./init/interact');

require('./mechanics/gui');
