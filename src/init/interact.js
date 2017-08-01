'use strict';

const THREE = require('three'),
    TWEEN = require('tween.js'),
    G = require('globals');

let sword;

function attack(event) {
    if (G.get('controls').enabled) {
        let raycaster = new THREE.Raycaster();
        raycaster.set(G.get('camera').getWorldPosition(), G.get('camera').getWorldDirection());

        if (sword && Date.now() - G.get('player').lastAttacked > 800) {
            let tween = new TWEEN.Tween(sword.rotation)
                .to({
                    x: [-Math.PI / 2, 0]
                }, 800)
                .start();

            G.get('tweens').push(tween);

            G.get('player').lastAttacked = Date.now();

            for (const entity of G.get('entities')) {

                let intersects = raycaster.intersectObjects(entity.mesh.children, true);
                if ((intersects.length && G.get('player').mesh.position.distanceTo(entity.mesh.position) < 5)) {
                    entity.callEvent('click');
                    G.get('player').attack(entity);
                }
            }
        }

    }
}

function interact(event) {
    let raycaster = new THREE.Raycaster();
    raycaster.set(G.get('camera').getWorldPosition(), G.get('camera').getWorldDirection());
    for (const entity of G.get('entities')) {

        let intersects = raycaster.intersectObjects(entity.mesh.children, true);
        if (intersects.length) {
            entity.callEvent('interact');
            Materialize.toast('You have interacted.', 400);
        }

    }
}

window.addEventListener('mousedown', (event) => {
    event.which == 2 || event.button == 4 ? interact(event) : attack(event); // if middle click, interact
});

window.addEventListener('keyup', (event) => !(event.keyCode == 69) || interact());

new THREE.ObjectLoader().load('/assets/3d/sword/sword.json', (weapon) => {
    G.get('camera').add(weapon);
    weapon.scale.set(0.1, 0.1, 0.1);
    weapon.position.x++;
    weapon.position.y -= 1.2;
    weapon.position.z -= 1.25;
    sword = weapon;
});
