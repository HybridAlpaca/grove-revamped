'use strict';

let G = require('globals');

const dt = 1 / 60;

module.exports = function animate() {
    
    requestAnimationFrame(animate);
    if (G.get('controls').enabled) {
        G.get('world').step(dt);
    }

    G.get('controls').update(Date.now() - G.get('time'));
    G.get('renderer').render(G.get('scene'), G.get('camera'));
    G.set('time', Date.now());

};
