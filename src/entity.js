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
        this.sounds = this.opts.sounds || [];
        let audioLoader = new THREE.AudioLoader();
        for (let i = 0; i < this.sounds.length; i++) {
            audioLoader.load(`/assets/sfx/${this.sounds[i]}`, (buffer) => {
                this.sounds[i] = new THREE.PositionalAudio(G.get('listener'));
                this.sounds[i].setBuffer(buffer);
                this.sounds[i].setRefDistance(20);
                this.mesh.add(this.sounds[i]);
                this.sounds[i].onEnded(() => this.sounds[i].stop());
            });
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

        this.inv = new Set(); // please be a wise choice...  This is inventory btw

    }

    attack(entity) {
        if (true) {
            entity.damage(this.dmg);
            this.lastAttacked = Date.now();
            this.callEvent('attack');
        }
    }

    damage(dmg) {
        this.hp -= dmg;
        if (this.hp <= 0) this.kill();
        this.lastDamaged = Date.now();
        this.callEvent('damage');
    }

    heal(hp) {
        // only heal if at least 3 seconds have gone by without being hurt
        if (Date.now() - this.lastDamaged > 3000) this.hp += hp;
        if (this.hp >= this.hpMax) this.hp = this.hpMax;
        this.callEvent('heal');
    }

    kill() {
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

        // find target
        for (const entity of G.get('entities')) {
            if (entity.id == this.id) continue;
            else if (mypos.distanceTo(entity.mesh.position) > 50) continue;
            else if (this.target && mypos.distanceTo(entity.mesh.position) < mypos.distanceTo(this.target.mesh.position)) {
                this.target = entity;
                if (this.sounds[0]) this.sounds[0].play();
            }
            else if (!this.target) this.target = entity;
        }

        if (this.target && mypos.distanceTo(this.target.mesh.position) > 50) this.target = null;

        const VELOCITYCAP = this.opts.speed || 7;

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

            if (mypos.distanceTo(targetpos) > (this.opts.hostility < 0 ? 5 : 7)) {
                // this.seen = false;
                if (mypos.x < targetpos.x) this.body.velocity.x++;
                else if (mypos.x > targetpos.x) this.body.velocity.x--;
                if (mypos.z < targetpos.z) this.body.velocity.z++;
                else if (mypos.z > targetpos.z) this.body.velocity.z--;
            }
            else if (G.get('tick') % 30 == 0 && this.opts.hostility < 0) {
                this.attack(this.target);
            }
        }
        else {
            // this should never happen

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

export class Item {
    constructor(id) {

        this.id = id;
        this.uuid = Math.random();

        // stats

        this.desc = String;
        this.weight = Number;
        this.value = Number;
        this.path = {
            img: String,
            model: String
        };

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
        sphereBody.position.set(0, 40, 0);
        sphereBody.linearDamping = 0.9;
        super('Player', new THREE.Object3D(), sphereBody);

        this.hp = 20;
        this.hpMax = 20;
        this.spd = 1;
        this.dmg = 1;
    }

    update(delta) {
        super.update(delta);
        $('#hp').html(`${this.hp}/${this.hpMax} hp`);
    }
}

export class Enemy extends AI {
    constructor(name, opts) {

        super(name, new THREE.Object3D(), new CANNON.Body(), opts);

        const enemies = require('./json/enemies.json');
        if (!enemies[name])
            throw new Error('Error: cannot find enemy with id of ' + name);
        const data = enemies[name];

        this.opts.hostility = -1;
        this.inv = data.inv;

        for (let key in data.stats) this[key] = data.stats[key];

        let loader = new THREE.ObjectLoader();

        loader.load(`/assets/3d/${data.path}.json`, (object) => {

            let body = new CANNON.Body({
                mass: 5
            });
            body.addShape(new CANNON.Sphere(1));
            body.position.set(opts.pos.x || 10, opts.pos.y || 20, opts.pos.z || 10);
            body.linearDamping = 0.9;

            this.mesh = object;
            G.get('scene').add(this.mesh);
            this.body = body;
            G.get('world').add(this.body);
        });

        this.addEventListener('kill', () => {
            for (let item of this.inv) {

                const items = require('./json/items');

                if (!items[item.id]) throw new Error('Error: cannot find item with id of ' + name);

                let amount = Math.round(Math.random() * item.max) + item.min;
                if (amount > item.max) amount = item.max;
                if (!amount) continue;
                Materialize.toast(`${item.id} (${amount}) added`, 1000);

            }
        });
    }
}
