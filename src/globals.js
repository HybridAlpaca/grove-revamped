'use strict';

const THREE = require('three'),
    CANNON = require('cannon'),
    postal = require('postal')

let G = module.exports = new Map();

G.set('time', Date.now());
G.set('tick', 0);

G.set('controls', {});
G.set('scene', new THREE.Scene());
G.set('renderer', new THREE.WebGLRenderer());
G.set('camera', new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000));

G.set('listener', new THREE.AudioListener());
G.get('camera').add(G.get('listener'));

G.set('player', {});
G.set('entities', []);
G.set('tweens', []);
G.set('world', new CANNON.World());

G.set('events', postal.channel('events'));

G.set('load', (mesh, opts) => {
    opts = opts ? opts : {};
    mesh.castShadow = true;
    mesh.receiveShadow = true;
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

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

G.set('label', (message, parameters) => {
    if (parameters === undefined) parameters = {};

    var fontface = parameters.hasOwnProperty("fontface") ?
        parameters["fontface"] : "Arial";

    var fontsize = parameters.hasOwnProperty("fontsize") ?
        parameters["fontsize"] : 18;

    var borderThickness = parameters.hasOwnProperty("borderThickness") ?
        parameters["borderThickness"] : 4;

    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : {
            r: 0,
            g: 0,
            b: 0,
            a: 1.0
        };

    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : {
            r: 255,
            g: 255,
            b: 255,
            a: 1.0
        };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    var metrics = context.measureText(message);
    var textWidth = metrics.width;

    // background color
    context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," +
        backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," +
        borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.

    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";

    context.fillText(message, borderThickness, fontsize + borderThickness);

    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    var spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false
    });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(100, 50, 1.0);
    return sprite;
});
