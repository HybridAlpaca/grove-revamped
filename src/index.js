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
 * NOTES:
 * ??/??/16 - RIP Jason, deleted in code
 * 05/23/17 - KJ forgot how to write a function
 * 05/24/17 - Billy the Blue Cube is a f*cking murderer
 * */


import {
    HUD
} from './mechanics/gui';

let NPC = require('./entity').NPC;

new HUD();

window.onerror = alert; // use only in dev

window.Grove = {
    version: '1.3.5',
    globals: require('globals')
};

Math.interval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
Array.prototype.has = function(data) {
    return this.indexOf(data) > -1;
};

let Wicket = window.wicket = new NPC('wicket', {
    pos: {},
    sounds: ['wicket.mp3', null, 'wicket-hurt.mp3', 'wicket-hurt.mp3']
});

require('./init/world')();
require('./init/scene')();
require('./init/update')();
require('./init/interact');

require('./mechanics/gui');
