'use strict';

const THREE = require('three'),
    TWEEN = require('tween.js'),
    G = require('globals'),
    $ = require('jquery');

import {
    Fire
}
from '../mechanics/particles';

let sword, magic = new Fire(),
    isUsingMagic = false,
    forceStopped = false,
    audio = new Audio('/assets/sfx/sword.mp3');

audio.volume = 0.1;

G.get('events').subscribe('system.update', () => {
    magic.particleGroup.tick(0.015);
    if (isUsingMagic && G.get('player').mp > 0) {
        G.get('player').mp -= 0.5;
        let raycaster = new THREE.Raycaster();
        raycaster.set(G.get('camera').getWorldPosition(), G.get('camera').getWorldDirection());
        for (const entity of G.get('entities')) {

            let intersects = raycaster.intersectObjects(entity.mesh.children, true);
            if (intersects.length) {
                entity.damage(0.2, G.get('player')); // deal magic damage
            }

        }
        G.get('player').lastUsedMagic = Date.now();
    }
    else {
        magic.emitter.particleCount = 0;
        G.get('camera').remove(magic.particleGroup.mesh);
        isUsingMagic = false;
        forceStopped = true;
        setTimeout(() => forceStopped = false, 500);
    }
});
magic.emitter.particleCount = 0;

function attack(event) {
    if (G.get('controls').enabled) {
        let raycaster = new THREE.Raycaster();
        raycaster.set(G.get('camera').getWorldPosition(), G.get('camera').getWorldDirection());

        if (sword && Date.now() - G.get('player').lastAttacked > 800) {

            G.get('events').publish('player.attack', {});

            let tween = new TWEEN.Tween(sword.rotation)
                .to({
                    x: [-Math.PI / 2, 0]
                }, 800)
                .onStart(() => {
                    audio.play();
                })
                .start();

            G.get('tweens').push(tween);

            G.get('player').lastAttacked = Date.now();

            for (const entity of G.get('entities')) {

                let intersects = raycaster.intersectObjects(entity.mesh.children, true);
                if ((intersects.length && G.get('player').mesh.position.distanceTo(entity.mesh.position) < 5)) {

                    entity.callEvent('click'); // mostly for debugging purposes
                    G.get('player').attack(entity); // attack them

                    for (var i = 0; i < G.get('player').poisons.length; i++) {

                        var poison = G.get('player').poisons[i];

                        console.log(poison);

                        for (let key in poison.effects) {

                            console.log(poison.effects[key]);
                            entity[key] += poison.effects[key];

                            if (entity.hp <= 0) entity.kill(G.get('player'))

                        }

                        G.get('player').poisons.splice(i, 1);

                    }
                }
            }

        }
    }
}

function attackAlt(event) {
    if (event.type == 'keydown' || event.type == 'mousedown' && !forceStopped) {
        magic.emitter.particleCount = 1000;
        G.get('camera').add(magic.particleGroup.mesh);
        isUsingMagic = true;
    }
    else {
        magic.emitter.particleCount = 0;
        G.get('camera').remove(magic.particleGroup.mesh);
        isUsingMagic = false;
    }
}

function interact(event) {
    let raycaster = new THREE.Raycaster();
    raycaster.set(G.get('camera').getWorldPosition(), G.get('camera').getWorldDirection());
    for (const entity of G.get('entities')) {

        let intersects = raycaster.intersectObjects(entity.mesh.children, true);
        if (intersects.length)
            entity.callEvent('interact');

    }
}

$(window).on('mousedown mouseup', (event) => {
    if (!G.get('controls').enabled) return;
    G.get('events').publish('system.click', event);
    if (event.which == 2 || event.button == 4) interact(event); // middle click
    else if (event.which == 1) attack(event); // left click
    else if (event.which == 3) attackAlt(event); // right click
});

$(window).on('keydown keyup', (event) => {
    if (!G.get('controls').enabled) return;
    !(event.keyCode == 69) || interact(event); // E
    !(event.keyCode == 81) || attack(event); // Q
    !(event.keyCode == 82) || attackAlt(event); // R
});

new THREE.ObjectLoader().load('/assets/3d/sword/sword.json', (weapon) => {
    G.get('camera').add(weapon);
    weapon.scale.set(0.1, 0.1, 0.1);
    weapon.position.x++;
    weapon.position.y -= 1.2;
    weapon.position.z -= 1.25;
    sword = weapon;
});
