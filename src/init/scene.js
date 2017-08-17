'use strict';

const $ = require('jquery'),
    THREE = require('three'),
    CANNON = require('cannon');

let G = require('globals'),
    renderer = G.get('renderer'),
    scene = G.get('scene');

module.exports = () => {

    // loading screen

    let loader = require('../json/loader');

    THREE.DefaultLoadingManager.onProgress = (item, loaded, total) => {
        console.log(`Loading ${item} (${loaded}/${total})`);
        $('#loaded').text(`${Math.floor(loaded/total*100)}% - v.${window.Grove.version}`);
    };

    THREE.DefaultLoadingManager.onLoad = () => {
        console.log('Loading complete');
        if (!$('#instructions').has('h4').length) $('#instructions').html(`
        <h4>${loader[Math.floor(Math.random() * loader.length)]}</h4>
        <button class='play-btn btn waves-effect waves-light light-green z-depth-3'>Play</button>
        `).addClass('pntrlk');
    };

    THREE.DefaultLoadingManager.onError = (item) => {
        console.error(`Error loading ${item}`);
    };



    scene.fog = new THREE.FogExp2(0xFFFFFF, 0.005);

    // Day/night cycle code

    let daynight = require('../threex/daynight').DayNight;

    let sunSphere = new daynight.SunSphere();
    scene.add(sunSphere.object3d);
    let skydom = new daynight.Skydom();
    scene.add(skydom.object3d);
    let sunLight = new daynight.SunLight();
    scene.add(sunLight.object3d);
    let sunAngle = 1 / 6 * Math.PI * 2;
    let dayDuration = 100;

    var ambient = new THREE.AmbientLight(0x222222);
    scene.add(ambient);

    G.get('events').subscribe('system.update', (data) => {

        if (!G.get('controls').enabled) return;

        sunAngle += 0.001 / dayDuration * Math.PI * 2;

        sunSphere.update(sunAngle);
        skydom.update(sunAngle);
        sunLight.update(sunAngle);

    });

    // Enable pointerlock controls

    var PointerLockControls = require('../threex/pointerlock');

    G.set('controls', new PointerLockControls(G.get('camera'), G.get('player').body));
    scene.add(G.get('controls').getObject());
    require('../threex/pointerlock.setup')(G.get('controls'));

    // Add game map

    new THREE.ObjectLoader().load('/assets/3d/skjar-isles/skjar-isles.json', (object) => {
        scene.add(object);
        object.castShadow = true;
        object.receiveShadow = true;
        object.traverse((child) => {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child instanceof THREE.Mesh && !/NP/gi.test(child.name)) {
                console.log(`Loading ${child.name}`);
                G.get('load')(child); // load the kiddos!
            }
            else if (child.name == 'NP_Ocean') {
                child.material.transparent = true;
                child.material.opacity = 0.9;
            }
        });
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color, 1);

    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

};

function onWindowResize() {
    G.get('camera').aspect = window.innerWidth / window.innerHeight;
    G.get('camera').updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log(`Window resized to ${window.innerWidth}, ${window.innerHeight}`);
}
