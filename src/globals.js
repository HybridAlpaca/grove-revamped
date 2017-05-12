'use strict';

const THREE = require('three'),
    CANNON = require('cannon')

let G = module.exports = new Map();

G.set('time', Date.now());
G.set('controls', {});
G.set('scene', new THREE.Scene());
G.set('renderer', new THREE.WebGLRenderer());
G.set('camera', new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000));
G.set('sphereBody', {});
G.set('player', {});
G.set('world', new CANNON.World());

G.set('load', (mesh, opts) => {
    opts = opts ? opts : {};
    mesh.castShadow = true;
    mesh.recieveShadow = true;
    var verts = [],
        faces = [];
    for (var i = 0; i < mesh.geometry.vertices.length; i++) {
        var v = mesh.geometry.vertices[i];
        verts.push(new CANNON.Vec3(v.x, v.y, v.z));
    }
    for (var i = 0; i < mesh.geometry.faces.length; i++) {
        var f = mesh.geometry.faces[i];
        faces.push([f.a, f.b, f.c]);
    }
    var cvph = new CANNON.ConvexPolyhedron(verts, faces);
    var Cbody = new CANNON.Body({
        mass: opts.mass || 0,
        material: opts.material || undefined
    });
    Cbody.addShape(cvph);
    Cbody.position.copy(mesh.position);
    Cbody.quaternion.copy(mesh.quaternion);
    G.get('world').add(Cbody);
    return {
        body: Cbody,
        shape: cvph,
        mesh: mesh
    };
});
