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
 * ??/??/16 - Rip Jason, deleted in code
 * 05/23/17 - KJ forgot how to write a function
 * 05/24/17 - Billy the Blue Cube is a f*cking murderer
 * */


let NPC = require('./entity').NPC;

window.onerror = alert; // use only in dev

window.Grove = {
    version: '1.2.2',
    globals: require('globals')
};

Math.interval = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

let Wicket = new NPC('wicket', {
    pos: {},
    sounds: ['wicket.mp3', 'silence.wav', 'silence.wav', 'silence.wav']
});

require('./init/world')();
require('./init/scene')();
require('./init/update')();
require('./init/interact');

require('./mechanics/gui');
