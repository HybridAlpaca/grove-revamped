let SPE = require('../threex/particles.min.js'),
    THREE = require('three'),
    G = require('globals');

export function Fire() {

    var particleGroup = new SPE.Group({
        texture: {
            value: THREE.ImageUtils.loadTexture('/assets/img/glow.png')
        }
    });

    let emitter = new SPE.Emitter({
        maxAge: {
            value: 1.5
        },
        position: {                  // x    y    z
            value: new THREE.Vector3(-0.7, -0.72, -0.94),
            spread: new THREE.Vector3(0, 0, 0) 
        },

        acceleration: {
            value: new THREE.Vector3(0, 0, 0),
            spread: new THREE.Vector3(0.5, 0.5, 0)
        },

        velocity: {
            value: new THREE.Vector3(0, 0, -5),
            spread: new THREE.Vector3(-0.5, -0.5, 0.5)
        },
        
        direction: 1, // this is fun af to toy with, make it -1 to draw magic from ur hand into the air

        color: {
            value: [new THREE.Color('purple'), new THREE.Color('orange'), new THREE.Color('red'), new THREE.Color('black')]
        },

        size: {
            value: 0.3
        },

        particleCount: 1000
    });

    particleGroup.addEmitter(emitter);

    return { particleGroup, emitter };

}
