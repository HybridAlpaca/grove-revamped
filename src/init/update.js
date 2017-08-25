'use strict';

let G = require('globals'),
    $ = require('jquery'),
    THREE = require('three'),
    CANNON = require('cannon');

import {
    Creature
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

    if (G.get('entities').length < 30) {
        // add in some enemies
        let type = 'slime';
        if (Math.random() < 0.25) type = 'slime.red';
        else if (Math.random() < 0.05) type = 'slime.blue';
        let enemy = new Creature(type, {
            pos: {
                x: Math.interval(G.get('player').mesh.position.x - 200, G.get('player').mesh.position.x + 200),
                y: 30,
                z: Math.interval(G.get('player').mesh.position.z - 200, G.get('player').mesh.position.z + 200),
                override: false // don't override territorial values (i.e. red slimes are in the mountains)
            },
            sounds: [null, 'slime-attack.wav', 'slime-hurt.wav', 'slime-die.wav']
        });
    }


    if (G.get('player').body.position.y < -100) G.get('player').body.position.set(0, 15, 0);
    else if (G.get('player').body.position.y < -20) {
        // player's underwater
        $('#overlay').css('background', 'blue').css('opacity', 0.5).show();
        G.get('player').stm -= 0.3;
        if (G.get('player').stm < 0) {
            G.get('player').stm = 0;
            G.get('player').damage(0.1);
        }
    }
    else $('#overlay').hide();

    G.get('controls').update(Date.now() - G.get('time'));
    G.get('renderer').render(G.get('scene'), G.get('camera'));
    G.set('time', Date.now());
    G.set('tick', G.get('tick') + 1);

    let raycaster = new THREE.Raycaster();
    raycaster.set(G.get('camera').getWorldPosition(), G.get('camera').getWorldDirection());
    for (const entity of G.get('entities')) {

        let intersects = raycaster.intersectObjects(entity.mesh.children, true);
        if (intersects.length) {
            if (entity.data) $('#label').html(`${entity.data.name /* entity.id */} (${Math.round(entity.hp)}/${entity.hpMax})`);
            $('#crosshair').attr('src', '/assets/img/crosshair/crosshair-enemy.png');
        }
        else if (G.get('tick') % 30 == 0) {
            $('#label').html('');
            $('#crosshair').attr('src', '/assets/img/crosshair/crosshair.png');
        }

    }

    G.get('events').publish('system.update', {
        delta
    });

};
