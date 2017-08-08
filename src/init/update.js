'use strict';

let G = require('globals'),
    $ = require('jquery'),
    THREE = require('three'),
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

    for (const tween of G.get('tweens')) {
        tween.update(delta);
    }

    if (G.get('entities').length < 20) {
        // add in some enemies
        let type = 'slime';
        if (Math.random() < 0.45) type = 'slime.red';
        else if (Math.random() < 0.025) type = 'slime.blue';
        let enemy = new Enemy(type, {
            pos: {
                x: Math.interval(G.get('player').mesh.position.x - 200, G.get('player').mesh.position.x + 200),
                y: 20,
                z: Math.interval(G.get('player').mesh.position.z - 200, G.get('player').mesh.position.z + 200),
                override: false // don't override territorial values (i.e. red slimes are in the mountains)
            },
            sounds: ['wicket.mp3', 'slime-attack.wav', 'slime-hurt.wav', 'slime-die.wav']
        });
    }


    if (G.get('player').body.position.y < -100) G.get('player').body.position.set(0, 15, 0);

    G.get('controls').update(Date.now() - G.get('time'));
    G.get('renderer').render(G.get('scene'), G.get('camera'));
    G.set('time', Date.now());
    G.set('tick', G.get('tick') + 1);

    let raycaster = new THREE.Raycaster();
    raycaster.set(G.get('camera').getWorldPosition(), G.get('camera').getWorldDirection());
    for (const entity of G.get('entities')) {

        let intersects = raycaster.intersectObjects(entity.mesh.children, true);
        if (intersects.length)
            $('#crosshair').attr('src', '/assets/img/crosshair/crosshair-enemy.png');
        else if (G.get('tick') % 30 == 0)
            $('#crosshair').attr('src', '/assets/img/crosshair/crosshair.png');

    }

    G.get('events').publish('system.update', {
        delta
    });

};
