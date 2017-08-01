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
    };

    THREE.DefaultLoadingManager.onLoad = () => {
        console.log('Loading complete');
        $('#instructions').html(`<h4>${loader[Math.floor(Math.random() * loader.length)]}</h4>`);
    };

    THREE.DefaultLoadingManager.onError = (item) => {
        console.error(`Error loading ${item}`);
    };



    scene.fog = new THREE.Fog(0xFFFFFF, 0, 500);

    var ambient = new THREE.AmbientLight(0x111111);
    scene.add(ambient);

    var light = new THREE.SpotLight(0xffffff);
    light.position.set(10, 30, 20);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;

    light.shadow.camera.left = -400;
    light.shadow.camera.right = 400;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -300;
    light.shadow.camera.near = 20;
    light.shadow.camera.far = 50; //camera.far;
    light.shadow.camera.fov = 70;

    light.shadowMapBias = 0.1;
    light.shadowMapDarkness = 0.7;
    light.shadow.mapSize.width = 2 * 512;
    light.shadow.mapSize.height = 2 * 512;
    scene.add(light);
    let spriteMaterial = new THREE.SpriteMaterial({
        map: new THREE.ImageUtils.loadTexture('/assets/img/glow.png'),
        color: 0xffffff,
        transparent: false,
        blending: THREE.AdditiveBlending
    });
    let sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(200, 200, 1.0);
    light.add(sprite);

    let uni = {
        time: {
            value: 1.0
        },
        resolution: {
            value: new THREE.Vector2()
        }
    };

    setInterval(() => {
        uni.time.value += 0.1;
        // let time = new Date().getTime() * 0.000015;
        let time = 2.1;
        let nsin = Math.sin(time);
        let ncos = Math.cos(time);
        // set the sun
        light.position.set(450 * nsin, 600 * nsin, 600 * ncos);

    }, 40);

    let imagePrefix = "/assets/skybox/";
    let directions = ["rightax2", "leftax2", "topax2", "", "frontax2", "backax2"];
    let imageSuffix = ".jpg";
    let skyGeometry = new THREE.CubeGeometry(2000, 2000, 2000);

    let materialArray = [];
    for (var i = 0; i < 6; i++)
        materialArray.push(new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
            side: THREE.BackSide,
            fog: false
        }));
    var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
    var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skyBox);

    var PointerLockControls = require('../threex/pointerlock');

    G.set('controls', new PointerLockControls(G.get('camera'), G.get('player').body));
    scene.add(G.get('controls').getObject());
    require('../threex/pointerlock.setup')(G.get('controls'));

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
