//a library that enables an inventory and makes you able to hold items, limited

const G = require('globals');

var player = G.get('player');

player.inventory = player.inventory || [];

function weapon (name, type, damage) {
    this.name = name;
    this.type = type;
    this.damage = damage;
    this.shape = new THREE.BoxGeometry(1, 1, 1);
    this.skin = new THREE.MeshLambertMaterial({color: 0xb0b0b0});
    this.form = new THREE.Mesh(this.shape, this.form);
    scene.add(this);
}

