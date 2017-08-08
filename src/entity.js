'use strict';

// load dependancies

const THREE = require('three'),
    CANNON = require('cannon'),
    TWEEN = require('tween.js'),
    G = require('globals'),
    $ = require('jquery');

// ADTs

export class Entity {
    constructor(id = 'Entity', mesh = new THREE.Object3D(), body = new CANNON.Body(), opts = {}) {
        console.log(`Entity: ${id} created`);
        this.id = id;
        this.uuid = Math.random();
        this.events = {};
        this.opts = opts;
        // sound effects
        this.sounds = [];
        if (this.opts.sounds) {
            for (let i = 0; i < this.opts.sounds.length; i++)
                this.loadAudio(this.opts.sounds[i], i);
        }
        // shape
        this.mesh = mesh;
        this.mesh.name = this.id;
        this.body = body;
        G.get('scene').add(mesh);
        G.get('world').add(body);
        G.get('entities').push(this);
    }
    update(delta) {
        this.mesh.position.copy(this.body.position);
        // this.mesh.quaternion.copy(this.body.quaternion);
        this.callEvent('update');
    }
    remove() {
        this.callEvent('remove');
        G.get('scene').remove(this.mesh);
        G.get('world').remove(this.body);
        G.get('entities').splice(G.get('entities').indexOf(this), 1);
    }

    // audio

    loadAudio(path, num) {
        if (!path) return;
        let audioLoader = new THREE.AudioLoader();
        audioLoader.load(`/assets/sfx/${path}`, (buffer) => {
            this.sounds[num] = new THREE.PositionalAudio(G.get('listener'));
            this.sounds[num].setBuffer(buffer);
            this.sounds[num].setRefDistance(5);
            this.mesh.add(this.sounds[num]);
            this.sounds[num].onEnded(() => this.sounds[num].stop());
        });
    }

    // events

    addEventListener(name, callback) {
        if (!(name in this.events)) this.events[name] = [];
        this.events[name].push(callback);
    }
    removeEventListener(name, callback) {} // todo
    callEvent(name) {
        if (!(name in this.events)) return;
        for (const cb of this.events[name]) cb();
    }
}

export class Living extends Entity {
    constructor(id = 'Living Entity', mesh, body, opts) {
        super(id, mesh, body, opts);

        // metadata

        this.lastDamaged = 0;
        this.lastAttacked = 0;

        // stats

        this.hp = Number; // health
        this.hpMax = Number;
        this.mp = Number; // mana
        this.mpMax = Number;
        this.stm = Number; // stamina
        this.stmMax = Number;

        this.str = Number; // strength
        this.dex = Number; // dexterity
        this.int = Number; // intelligence
        this.cnt = Number; // constitution
        this.chr = Number; // charisma

        this.inv = []; // inventory
        this.effects = []; // buffs, ex. bleeding, on fire, fast healing, etc.

    }

    attack(entity) {
        if (!G.get('controls').enabled) return;
        entity.damage(this.dmg);
        this.lastAttacked = Date.now();
        this.callEvent('attack');
    }

    damage(dmg) {
        if (!G.get('controls').enabled) return;
        this.hp -= dmg;
        if (this.hp <= 0) this.kill();
        this.lastDamaged = Date.now();
        this.callEvent('damage');
    }

    heal(hp) {
        if (!G.get('controls').enabled) return;
        // only heal if at least 5 seconds have gone by without being hurt
        if (Date.now() - this.lastDamaged > 5000) this.hp += hp;
        if (this.hp >= this.hpMax) this.hp = this.hpMax;
        this.callEvent('heal');
    }

    kill() {
        if (!G.get('controls').enabled) return;
        this.remove();
        this.callEvent('kill');
    }

    update(delta) {
        super.update(delta);
        if (G.get('tick') % 50 == 0) this.heal(1);
    }
}

export class AI extends Living {
    constructor(id = 'AI', mesh, body, opts) {
        super(id, mesh, body, opts);

        this.target = null;
        this.seen = false;
        this.tween = false;

        this.hp = 5;
        this.hpMax = 5;
        this.mp = 1;
        this.mpMax = 1;
        this.stm = 3;
        this.stmMax = 3;

        this.str = 1;
        this.dex = 1;
        this.int = 1;
        this.cnt = 1;
        this.chr = 1;
    }

    update(delta) {
        super.update(delta); // this calls for a super update!

        let mypos = this.mesh.position;

        /*
        Sounds reference:
        [0] - target seen
        [1] - attacking
        [2] - damaged
        [3] - death
        */

        // find target
        for (const entity of G.get('entities')) {
            if (entity != G.get('player')) continue; // prevent cannibalism
            else if (mypos.distanceTo(entity.mesh.position) > 50) continue;
            else if (this.target && mypos.distanceTo(entity.mesh.position) < mypos.distanceTo(this.target.mesh.position)) {
                this.target = entity;
                if (this.sounds[0] && G.get('controls').enabled) this.sounds[0].play();
            }
            else if (!this.target) {
                this.target = entity;
                // if (this.sounds[0]) this.sounds[0].play();
            }
        }

        if (this.target && mypos.distanceTo(this.target.mesh.position) > 50) this.target = null;

        const VELOCITYCAP = this.spd || 7;

        this.addEventListener('damage', () => { if (this.sounds[2] && G.get('controls').enabled && !this.sounds[2].isPlaying && this.hp > 0) this.sounds[2].play() });
        this.addEventListener('kill', () => { if (this.sounds[3] && G.get('controls').enabled && !this.sounds[3].isPlaying) this.sounds[3].play() });

        if (this.target) {
            let targetpos = this.target.mesh.position;

            // tweened lookat
            if (!this.tween) {
                this.tween = true;
                var startRotation = new THREE.Euler().copy(this.mesh.rotation);

                // final rotation (with lookAt)
                this.mesh.lookAt(new THREE.Vector3(targetpos.x, mypos.y, targetpos.z));
                var endRotation = new THREE.Euler().copy(this.mesh.rotation);

                // revert to original rotation
                this.mesh.rotation.copy(startRotation);

                // Tween
                let tween = new TWEEN.Tween(this.mesh.rotation)
                    .to({
                        x: startRotation.x,
                        y: endRotation.y,
                        z: startRotation.z
                    }, 60)
                    .start()
                    .onComplete(() => {
                        this.tween = false;
                        G.get('tweens').splice(G.get('tweens').indexOf(tween), 1);
                    });

                G.get('tweens').push(tween);
            }


            // if you would like to witness two cubes have sex,
            // comment out the following if statement, but leave
            // the lines inside it.  Yes, Hunter, I'm talking to you.

            if (mypos.distanceTo(targetpos) > (this.opts.hostility < 0 ? 5 : 12)) {
                // this.seen = false;
                if (mypos.x < targetpos.x) this.body.velocity.x++;
                else if (mypos.x > targetpos.x) this.body.velocity.x--;
                if (mypos.z < targetpos.z) this.body.velocity.z++;
                else if (mypos.z > targetpos.z) this.body.velocity.z--;
            }
            else if (G.get('tick') % 50 == 0 && this.opts.hostility < 0) {
                this.attack(this.target);
                if (this.sounds[1]) this.sounds[1].play();
            }
        }
        else {
            // this should never happen

            this.body.velocity.x = 0;
            this.body.velocity.z = 0;

            // nevermind, it does if ai
            // gets far enough away from
            // target and no others are available
        }

        if (this.body.velocity.x > VELOCITYCAP) this.body.velocity.x = VELOCITYCAP;
        else if (this.body.velocity.x < -VELOCITYCAP) this.body.velocity.x = -VELOCITYCAP;
        if (this.body.velocity.z > VELOCITYCAP) this.body.velocity.z = VELOCITYCAP;
        else if (this.body.velocity.z < -VELOCITYCAP) this.body.velocity.z = -VELOCITYCAP;
    }
}

// class declarations

export class Player extends Living {
    constructor() {
        const mass = 5,
            radius = 1.3;
        let sphereShape = new CANNON.Sphere(radius);
        let sphereBody = new CANNON.Body({
            mass
        });
        sphereBody.addShape(sphereShape);
        let raycaster = new THREE.Raycaster(new THREE.Vector3(0, 40, 0), new THREE.Vector3(0, -1, 0));
        let intersects = raycaster.intersectObjects(G.get('scene').children, true);
        if (intersects.length > 0) {
            let pos = intersects[0].point;
            sphereBody.position.set(pos.x, pos.y, pos.z);
        }
        else
            sphereBody.position.set(200, 20, 0);

        super('Player', new THREE.Object3D(), sphereBody);

        this.hp = 20;
        this.hpMax = 20;
        this.spd = 1;
        this.dmg = 1;
    }

    update(delta) {
        super.update(delta);
        $('#hp').html(`${this.hp}/${this.hpMax} hp`);
        this.body.velocity.x *= 0.925;
        this.body.velocity.z *= 0.925;
    }
}

export class Enemy extends AI {
    constructor(name, opts) {

        super(name, new THREE.Object3D(), new CANNON.Body(), opts);

        const enemies = require('./json/enemies.json');
        if (!enemies[name])
            throw new Error('Error: cannot find enemy with id of ' + name);
        const data = enemies[name];

        this.data = data;

        this.opts.hostility = -1;
        this.inv = data.inv;

        for (let key in data.stats) this[key] = data.stats[key];

        let loader = new THREE.ObjectLoader();

        loader.load(`/assets/3d/${data.path}.json`, (object) => {

            let body = new CANNON.Body({
                mass: 5
            });
            body.addShape(new CANNON.Sphere(1));
            let position;
            position = new CANNON.Vec3(opts.pos.x || 10, opts.pos.y || 20, opts.pos.z || 10);
            if (data.meta && data.meta.spawn) {
                let pos = data.meta.spawn;
                if (pos.length == 6) position = new CANNON.Vec3(Math.interval(pos[0], pos[1]), Math.interval(pos[2], pos[3]), Math.interval(pos[4], pos[5]));
                else position = new CANNON.Vec3(pos[0], pos[1], pos[2]);
            }
            let raycaster = new THREE.Raycaster(new THREE.Vector3(position.x, position.y, position.z), new THREE.Vector3(0, -1, 0));
            let intersects = raycaster.intersectObjects(G.get('scene').children, true);
            if (intersects.length > 0) {
                let pos = intersects[0].point;
                body.position.set(pos.x, pos.y + 3, pos.z);
            }
            else
                body.position.set(position.x, position.y, position.z);
            body.linearDamping = 0.9;

            object.traverse((child) => {
                for (let mesh of data.mesh) {
                    if (mesh.name.toLowerCase() == child.name.toLowerCase()) {
                        for (let key in mesh) {
                            child.material[key] = mesh[key];
                            if (key == 'color') child.material[key] = new THREE.Color(mesh[key]);
                        }
                    }
                }
            });

            this.label = document.createElement('div');
            document.body.appendChild(this.label);
            this.label.className += 'entity-label';
            this.label.innerHTML = `${data.name}`;
            this.label.style.position = 'absolute';

            this.mesh = object;
            G.get('scene').add(this.mesh);
            this.body = body;
            G.get('world').add(this.body);

        });

        this.addEventListener('kill', () => {

            this.label.style.display = 'none';

            // Loop through inventory on death and give player drop items.
            // TODO: Detect who killed AI, and give them drops, instead of
            // defaulting to player.

            for (let item of this.inv) {

                const items = require('./json/items');

                if (!items[item.id]) throw new Error('Error: cannot find item with id of ' + name);

                let amount = Math.round(Math.random() * item.max) + item.min;
                if (amount > item.max) amount = item.max;
                if (!amount) continue;
                for (let i = 0; i < amount; i++) G.get('player').inv.push(items[item.id]);
                if (amount > 1) Materialize.toast(`${item.id} (${amount}) added`, 1000);
                else Materialize.toast(`${item.id} added`, 1000);

            }
        });
    }

    update() {
        super.update();

        // Delete this enemy if it's too far away from anyone to bother updating it.

        if (!(this.data.meta && this.data.meta.spawn) && this.target && this.mesh.position.distanceTo(this.target.mesh.position) > 250) {
            this.body.position.x = Math.interval(G.get('player').mesh.position.x - 200, G.get('player').mesh.position.x + 200);
            this.body.position.y = 20;
            this.body.position.z = Math.interval(G.get('player').mesh.position.z - 200, G.get('player').mesh.position.z + 200);
            console.log('Moved.');
        }
        else if (!(this.data.meta && this.data.meta.spawn) && this.mesh.position.distanceTo(G.get('player').mesh.position) > 450) {
            this.body.position.x = Math.interval(G.get('player').mesh.position.x - 200, G.get('player').mesh.position.x + 200);
            this.body.position.y = 20;
            this.body.position.z = Math.interval(G.get('player').mesh.position.z - 200, G.get('player').mesh.position.z + 200);
            console.log('Moved.');
        }

        // The following code depends on the label being loaded; if it isn't, stop the update.

        if (!this.label) return;

        this.label.innerHTML = `${this.data.name} (${this.hp}/${this.hpMax})`;

        G.get('camera').updateMatrix();
        G.get('camera').updateMatrixWorld();
        var frustum = new THREE.Frustum();
        frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(G.get('camera').projectionMatrix, G.get('camera').matrixWorldInverse));

        if (!frustum.containsPoint(this.mesh.position) || this.mesh.position.distanceTo(G.get('player').mesh.position) > 50)
            this.label.style.display = 'none';
        else
            this.label.style.display = 'block';

        var position = require('./threex/objcoord').ObjCoord.cssPosition(this.mesh, G.get('camera'), G.get('renderer'));
        this.label.style.left = (position.x - this.label.offsetWidth / 2) + 'px';
        this.label.style.top = (position.y - this.label.offsetHeight / 2) - 20 + 'px';
    }
}

export class NPC extends AI {
    constructor(name, opts) {

        super(name, new THREE.Object3D(), new CANNON.Body(), opts);

        const npcs = require('./json/npcs.json');
        if (!npcs[name])
            throw new Error('Error: cannot find NPC with id of ' + name);
        const data = npcs[name];

        this.opts.hostility = 1;
        this.inv = data.inv;

        for (let key in data.stats) this[key] = data.stats[key];

        let loader = new THREE.ObjectLoader();

        loader.load(`/assets/3d/${data.path}.json`, (object) => {

            object.scale.set(0.01, 0.01, 0.01);

            let body = new CANNON.Body({
                mass: 5
            });
            body.addShape(new CANNON.Sphere(2.25));
            let position;
            position = new CANNON.Vec3(opts.pos.x || 10, opts.pos.y || 20, opts.pos.z || 10);
            if (data.meta && data.meta.spawn) {
                let pos = data.meta.spawn;
                if (pos.length == 6) position = new CANNON.Vec3(Math.interval(pos[0], pos[1]), Math.interval(pos[2], pos[3]), Math.interval(pos[4], pos[5]));
                else position = new CANNON.Vec3(pos[0], pos[1], pos[2]);
            }
            let raycaster = new THREE.Raycaster(new THREE.Vector3(position.x, position.y, position.z), new THREE.Vector3(0, -1, 0));
            let intersects = raycaster.intersectObjects(G.get('scene').children, true);
            if (intersects.length > 0) {
                let pos = intersects[0].point;
                body.position.set(pos.x, pos.y + 3, pos.z);
            }
            else
                body.position.set(position.x, position.y, position.z);
            body.linearDamping = 0.9;

            this.mesh = object;
            G.get('scene').add(this.mesh);
            this.body = body;
            G.get('world').add(this.body);

        });
    }
}
