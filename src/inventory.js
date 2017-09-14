//a library that enables an inventory and makes you able to hold items, limited

const G = require('globals');

var player = G.get('player');

player.inventory = player.inventory || [];

function weapon (name, type, damage) {
    // this marks the time when KJ Avakian forgot how to define a function correctly. It was a very sad, sad day, and we hope it never happens. EVER
    /* this is what he wrote:
    function weapon = {
        this.
    }
    ugh 
    
    why is this still here?!
    
    */
    
    this.name = name;
    this.type = type;
    this.damage = damage;
    this.shape = new THREE.BoxGeometry(1, 1, 1);
    this.skin = new THREE.MeshLambertMaterial({color: 0xb0b0b0});
    this.form = new THREE.Mesh(this.shape, this.form);
    scene.add(this);
}

