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
 * - GUI (0/3)
 *  X inventory
 *  X map
 *  X crafting
 * 
 * NOTES:
 * ??/??/16 - Rip Jason, deleted in code
 * 05/23/17 - KJ forgot how to write a function
 * 05/24/17 - Billy the Blue Cube is a f*cking murderer
 * */

window.onerror = alert; // use only in dev

import gui from './mechanics/gui';

new gui('The Grove', 'Hello! Thanks for playing our little game :) The Grove is an action RPG inspired by such games as Skyrim, and aims to be playable all in your browser.  We know the 3D graphics are bad (chillax, we\'re a band of unruly 14 year olds), but we must say the 2D ones are pretty sweet - props to Hunter "Goont" Sokolis for those.  Anyway, helpful crticism and new ideas are always welcome, so pop right in and have the best 3 minutes of your life! ;)<br><br>Thanks for playing, HA Game Studios');

require('./init/world')();
require('./init/scene')();
require('./init/update')();
require('./init/interact');