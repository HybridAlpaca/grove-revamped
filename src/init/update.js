'use strict';

let G = require('globals'),
    CANNON = require('cannon');

import {
    Enemy
}
from '../entity';

const dt = 1 / 60;

module.exports = function animate(delta) {

    // To all you lowly peasants who don't know what
    // requestAnimationFrame is, replace it with setInterval
    // and see what it does.  >;)

    requestAnimationFrame(animate);

    if (G.get('controls').enabled) {
        G.get('world').step(dt);
    }

    for (const entity of G.get('entities')) {
        entity.update(delta);
    }
    
    for(const tween of G.get('tweens')) {
        tween.update(delta);
    }

    if (G.get('entities').length < 15) {
        // add in some enemies
        let enemy = new Enemy('slime', {
            pos: {
                x: Math.random() * 500 - 250,
                y: 20,
                z: Math.random() * 500 - 250
            }
        });
    }

    if (G.get('player').body.position.y < -200) G.get('player').body.position.set(0, 15, 0);

    G.get('controls').update(Date.now() - G.get('time'));
    G.get('renderer').render(G.get('scene'), G.get('camera'));
    G.set('time', Date.now());
    G.set('tick', G.get('tick') + 1);

};
