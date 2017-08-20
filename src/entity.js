'use strict';

// load dependancies

const THREE = require('three'),
    CANNON = require('cannon'),
    G = require('globals'),
    $ = require('jquery');

// ADTs

export class Entity {
    constructor(id = 'Entity', mesh = new THREE.Object3D(), body = new CANNON.Body(), opts = {}) {

        // Metadata

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

        // get from cache if available to prevent eccessive audio loading

        if (G.get('cache').audio[path]) {
            this.sounds[num] = new THREE.PositionalAudio(G.get('listener'));
            this.sounds[num].setBuffer(G.get('cache').audio[path]);
            this.sounds[num].setRefDistance(30);
            if (this.mesh) this.mesh.add(this.sounds[num]);
            this.sounds[num].onEnded(() => this.sounds[num].stop());
        }
        else {
            let audioLoader = new THREE.AudioLoader();
            audioLoader.load(`/assets/sfx/${path}`, (buffer) => {
                G.get('cache').audio[path] = buffer;
                this.sounds[num] = new THREE.PositionalAudio(G.get('listener'));
                this.sounds[num].setBuffer(buffer);
                this.sounds[num].setRefDistance(30);
                this.mesh.add(this.sounds[num]);
                this.sounds[num].onEnded(() => this.sounds[num].stop());
            });
        }
    }

    // events

    addEventListener(name, callback) {
        if (!(name in this.events)) this.events[name] = [];
        this.events[name].push(callback);
    }
    removeEventListener(name, callback) {} // todo
    callEvent(name, ...params) {
        if (!(name in this.events)) return;
        for (const cb of this.events[name]) cb(...params);
    }
}

export class Living extends Entity {
    constructor(id = 'Living Entity', mesh, body, opts) {
        super(id, mesh, body, opts);

        // metadata

        this.lastDamaged = 0;
        this.lastAttacked = 0;
        this.lastUsedStamina = 0;
        this.lastUsedMagic = 0;

        // stats

        this.hp = Number; // health
        this.hpMax = Number;
        this.mp = Number; // mana
        this.mpMax = Number;
        this.stm = Number; // stamina
        this.stmMax = Number;

        // Can't have these as abstract values, as
        // leveling equation requires real data

        this.lvl = 1; // level
        this.xp = 0; // experience
        this.xpMax = Math.pow(this.lvl, 2) / 0.04; // xp until next level

        this.str = Number; // strength
        this.dex = Number; // dexterity
        this.int = Number; // intelligence
        this.cnt = Number; // constitution
        this.chr = Number; // charisma

        this.inv = []; // inventory
        this.effects = []; // buffs, ex. bleeding, on fire, fast healing, etc.

    }

    gainXP(xp) {
        this.xp += xp;
        this.xpMax = Math.pow(this.lvl, 2) / 0.04;
        if (this.xp > this.xpMax) {
            this.lvl++;
            this.xp = 0;
            this.callEvent('levelUp');
        }
    }

    attack(entity) {
        if (!G.get('controls').enabled) return;
        entity.damage(this.dmg, this);
        this.lastAttacked = Date.now();
        this.callEvent('attack');
    }

    damage(dmg, attacker) {
        if (!G.get('controls').enabled) return;
        this.hp -= dmg;
        if (this.hp <= 0) this.kill(attacker);
        this.lastDamaged = Date.now();
        this.callEvent('damage');
    }

    heal(hp, stm, mp) {
        if (!G.get('controls').enabled) return;

        this.hp += hp;
        this.mp += mp;
        this.stm += stm;

        if (this.hp >= this.hpMax) this.hp = this.hpMax;
        if (this.mp >= this.mpMax) this.mp = this.mpMax;
        if (this.stm >= this.stmMax) this.stm = this.stmMax;

        this.callEvent('heal');
    }

    kill(attacker) {
        if (!G.get('controls').enabled) return;
        this.remove();
        this.callEvent('kill', {
            attacker
        });
    }

    update(delta) {
        super.update(delta);

        this.heal(
            Date.now() - this.lastDamaged > 5000 ? 1 / 10 : 0,
            Date.now() - this.lastUsedStamina > 2000 ? 1 / 10 : 0,
            Date.now() - this.lastUsedMagic > 2000 ? 1 / 10 : 0
        );
    }
}

export class AI extends Living {
    constructor(id = 'AI', mesh, body, opts) {
        super(id, mesh, body, opts);

        // metadata

        this.target = null;
        this.seen = false;

        // properties

        this.hp = 5;
        this.hpMax = 5;
        this.mp = 1;
        this.mpMax = 1;
        this.stm = 3;
        this.stmMax = 3;

        // stats

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
            if (entity.id == this.id) continue; // prevent cannibalism
            else if (mypos.distanceTo(entity.mesh.position) > 50) continue;
            else if (this.data && this.data.hostility && this.data.hostility[1].has(entity.id)) continue;
            else if (this.target && mypos.distanceTo(entity.mesh.position) < mypos.distanceTo(this.target.mesh.position)) {
                this.target = entity;
                if (this.sounds[0] && this.hp > 0 && G.get('controls').enabled) this.sounds[0].play();
                this.callEvent('newTarget', this.target);
            }
            else if (!this.target) {
                this.target = entity;
                if (this.sounds[0] && this.hp > 0 && G.get('controls').enabled) this.sounds[0].play();
                this.callEvent('newTarget', this.target);
            }
        }

        if (this.target && mypos.distanceTo(this.target.mesh.position) > 50) this.target = null;

        const VELOCITYCAP = this.spd || 7;

        this.addEventListener('damage', () => { if (this.sounds[2] && this.hp > 0 && G.get('controls').enabled && !this.sounds[2].isPlaying && this.hp > 0) this.sounds[2].play() });
        this.addEventListener('kill', () => { if (this.sounds[3] && this.hp > 0 && G.get('controls').enabled && !this.sounds[3].isPlaying) this.sounds[3].play() });

        if (this.target) {

            let targetpos = this.target.mesh.position;

            this.mesh.lookAt(new THREE.Vector3(targetpos.x, this.mesh.position.y, targetpos.z));

            // if you would like to witness two cubes have sex,
            // comment out the following if statement, but leave
            // the lines inside it.  Yes, Hunter, I'm talking to you.

            let hostility = 0; // neutral until we decide otherwise
            if (this.data && this.data.hostility[0].has(this.target.id)) hostility = -1;
            else if (this.data && this.data.hostility[2].has(this.target.id)) hostility = 1;
            else hostility = this.opts.hostility;

            this.hostility = hostility;

            let velocity = 1;
            if (hostility > 0) velocity *= -1;

            if (hostility != 0 && mypos.distanceTo(targetpos) > (hostility > 0 ? 10 : 5)) {
                if (mypos.x < targetpos.x) this.body.velocity.x += velocity;
                else if (mypos.x > targetpos.x) this.body.velocity.x -= velocity;
                if (mypos.z < targetpos.z) this.body.velocity.z += velocity;
                else if (mypos.z > targetpos.z) this.body.velocity.z -= velocity;
            }
            else if (G.get('tick') % 50 == 0 && hostility < 0) {
                this.attack(this.target);
                if (this.sounds[1] && G.get('controls').enabled) this.sounds[1].play();
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

        // fall damage

        sphereBody.addEventListener('collide', (event) => {

            const contact = event.contact;
            const upAxis = new CANNON.Vec3(0, 1, 0);
            let contactNormal = new CANNON.Vec3();
            if (contact.bi.id == sphereBody.id)
                contact.ni.negate(contactNormal);
            else
                contactNormal.copy(contact.ni); // bi is something else. Keep the normal as it is
            if (contactNormal.dot(upAxis) > 0.5 && sphereBody.velocity.y <= -30)
                this.hp += Math.floor(sphereBody.velocity.y / 5);
        });

        // spawn on ground if possible, otherwise spawn high in the air

        let raycaster = new THREE.Raycaster(new THREE.Vector3(0, 40, 0), new THREE.Vector3(0, -1, 0));
        let intersects = raycaster.intersectObjects(G.get('scene').children, true);
        if (intersects.length > 0) {
            let pos = intersects[0].point;
            sphereBody.position.set(pos.x, pos.y, pos.z);
        }
        else
            sphereBody.position.set(200, 2, 0);

        super('player', new THREE.Object3D(), sphereBody);

        this.poisons = [];

        this.lvl = 1;
        this.xp = 0;

        this.hp = 100;
        this.hpMax = 100;

        this.stm = 100;
        this.stmMax = 100;

        this.mp = 100;
        this.mpMax = 100;

        this.spd = 0.5;
        this.dmg = 1;
    }

    update(delta) {
        super.update(delta);
        $('#hp').html(`${this.hp}/${this.hpMax} hp`);
        this.body.velocity.x *= 0.925;
        this.body.velocity.z *= 0.925;
    }

    damage(dmg) {
        super.damage(dmg);
        $('#vignette').fadeIn(550).fadeOut(550);
    }
}

export class Creature extends AI {
    constructor(name, opts) {

        super(name, new THREE.Object3D(), new CANNON.Body(), opts);

        const creatures = require('./json/creatures.json');
        if (!creatures[name])
            throw new Error('Error: cannot find creature with id of ' + name);
        const data = creatures[name];

        this.data = data;

        this.id = this.data.id;

        this.inv = data.inv;

        for (let key in data.stats) this[key] = data.stats[key];

        let loader = new THREE.ObjectLoader();

        loader.load(`/assets/3d/${data.path}.json`, (object) => {

            G.get('cache').json[data.path] = object;

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

            this.mesh = object;
            G.get('scene').add(this.mesh);
            this.body = body;
            G.get('world').add(this.body);

        });

        this.addEventListener('kill', (data) => {

            // Loop through inventory on death and give attacker the drop items.

            for (let item of this.inv) {

                const items = require('./json/items');

                if (!items[item.id]) throw new Error('Error: cannot find item with id of ' + name);

                let amount = Math.round(Math.random() * item.max) + item.min;
                if (amount > item.max) amount = item.max;
                if (!amount) continue;
                for (let i = 0; i < amount; i++) data.attacker.inv.push(items[item.id]);
                if (data.attacker == G.get('player')) {
                    if (amount > 1) Materialize.toast(`${item.id} (${amount}) added`, 1000);
                    else Materialize.toast(`${item.id} added`, 1000);
                }

            }
        });
    }

    update() {
        super.update();

        // If this creature is too far from the player / its current target, move it closer.

        if (!(this.data.meta && this.data.meta.spawn) && this.mesh.position.distanceTo(G.get('player').mesh.position) > 250) {
            let position = new CANNON.Vec3();
            position.x = Math.interval(G.get('player').mesh.position.x - 200, G.get('player').mesh.position.x + 200);
            position.y = 20;
            position.z = Math.interval(G.get('player').mesh.position.x - 200, G.get('player').mesh.position.x + 200);
            let raycaster = new THREE.Raycaster(new THREE.Vector3(position.x, position.y, position.z), new THREE.Vector3(0, -1, 0));
            let intersects = raycaster.intersectObjects(G.get('scene').children, true);
            if (intersects.length > 0) {
                let pos = intersects[0].point;
                this.body.position.set(pos.x, pos.y + 3, pos.z);
            }
            else
                this.body.position.set(position.x, position.y, position.z);
        }

    }
}

export class NPC extends AI {
    constructor(name, opts) {

        super(name, new THREE.Object3D(), new CANNON.Body(), opts);

        const npcs = require('./json/npcs.json');
        if (!npcs[name])
            throw new Error('Error: cannot find NPC with id of ' + name);
        const data = npcs[name];

        this.data = data;

        this.inv = data.inv;

        for (let key in data.stats) this[key] = data.stats[key];

        let loader = new THREE.ObjectLoader();

        loader.load(`/assets/3d/${data.path}.json`, (object) => {

            object.scale.set(2, 2, 2);

            let body = new CANNON.Body({
                mass: 5
            });
            body.addShape(new CANNON.Sphere(0.75));
            let position;
            position = new CANNON.Vec3(opts.pos.x || 10, opts.pos.y || 20, opts.pos.z || 10);
            if (data.meta && data.meta.spawn) {
                let pos = data.meta.spawn;
                if (pos.length == 6) position = new CANNON.Vec3(Math.interval(pos[0], pos[1]), Math.interval(pos[2], pos[3]), Math.interval(pos[4], pos[5]));
                else position = new CANNON.Vec3(pos[0], pos[1], pos[2]);
            }
            body.position.set(position.x, position.y, position.z);
            body.linearDamping = 0.9;

            this.mesh = object;
            G.get('scene').add(this.mesh);
            this.body = body;
            G.get('world').add(this.body);

        });

        // dont follow until have enough gelatin

        this.addEventListener('newTarget', (target) => {
            this.hasChosenTarget = this.hasChosenTarget || false;
            this.hasSpokenInteract = this.hasSpokenInteract || false;
            if (!this.hasChosenTarget) this.target = null;
            this.sounds[0] = null;
        });

        // run this when user interacts with Wicket

        this.addEventListener('interact', () => {
            let gelatin = 0;
            for (let item of G.get('player').inv) {
                if (item.id == 'gelatin') gelatin++;
            }

            // if doesn't have enough gelatin, dont follow

            if (gelatin < 5) {
                let audio = document.createElement('audio');
                audio.src = '/assets/sfx/wicket-request.mp3';
                audio.addEventListener('ended', () => {
                    new Audio('/assets/sfx/wicket-tutorial-inventory.mp3').play();
                });
                audio.play();
            }

            // otherwise, follow

            else {
                this.hasChosenTarget = true;
                this.target = G.get('player');
                new Audio('/assets/sfx/wicket-thanks.mp3').play();
            }

        });

        // and then there's this fuckfest

        let enter = G.get('events').subscribe('system.pointerlock.enter', () => {

            let audio = document.createElement('audio');
            audio.src = '/assets/sfx/wicket-help.mp3';
            audio.addEventListener('ended', () => {

                let audio = document.createElement('audio');
                audio.src = '/assets/sfx/wicket-tutorial-look.mp3';

                audio.addEventListener('ended', () => {

                    let look = G.get('events').subscribe('player.look', () => {

                        let audio = document.createElement('audio');
                        audio.src = '/assets/sfx/wicket-success.mp3';
                        audio.addEventListener('ended', () => {
                            let audio = document.createElement('audio');
                            audio.src = '/assets/sfx/wicket-tutorial-move.mp3';
                            audio.addEventListener('ended', () => {

                                let move = G.get('events').subscribe('player.move', () => {

                                    let audio = document.createElement('audio');
                                    audio.src = '/assets/sfx/wicket-success.mp3';
                                    audio.addEventListener('ended', () => {

                                        let audio = document.createElement('audio');
                                        audio.src = '/assets/sfx/wicket-tutorial-attack.mp3';
                                        audio.addEventListener('ended', () => {

                                            let click = G.get('events').subscribe('system.click', () => {

                                                let audio = document.createElement('audio');
                                                audio.src = '/assets/sfx/wicket-success.mp3';
                                                audio.addEventListener('ended', () => {
                                                    let audio = document.createElement('audio');
                                                    audio.src = '/assets/sfx/wicket-help-2.mp3';
                                                    audio.addEventListener('ended', () => {
                                                        new Audio('/assets/sfx/wicket-tutorial-interact.mp3').play();
                                                    });
                                                    audio.play();
                                                });
                                                audio.play();
                                                click.unsubscribe();

                                            });

                                        });
                                        audio.play();

                                    });
                                    audio.play();

                                    move.unsubscribe();

                                });

                                look.unsubscribe();

                            });
                            audio.play();
                        });
                        audio.play();

                        look.unsubscribe();

                    });

                });

                audio.play();

            });
            audio.play();
            enter.unsubscribe();

        });

    }
}
