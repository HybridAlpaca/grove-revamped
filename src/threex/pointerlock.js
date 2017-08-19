/**
 * @author mrdoob / http://mrdoob.com/
 * @author schteppe / https://github.com/schteppe
 */

var THREE = require('three'),
    CANNON = require('cannon'),
    G = require('globals');

var PointerLockControls = module.exports = function(camera, cannonBody) {

    var footstep = new Audio('/assets/sfx/leaves01.ogg');

    var eyeYPos = 2; // eyes are 2 meters above the ground
    var jumpVelocity = 10;
    var scope = this;

    var pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    var yawObject = new THREE.Object3D();
    yawObject.position.y = 2;
    yawObject.add(pitchObject);

    var quat = new THREE.Quaternion();

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;

    var canJump = false; // white kid
    var isSprinting = false;

    var contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
    var upAxis = new CANNON.Vec3(0, 1, 0);
    cannonBody.addEventListener("collide", function(e) {
        var contact = e.contact;

        // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
        // We do not yet know which one is which! Let's check.
        if (contact.bi.id == cannonBody.id) // bi is the player body, flip the contact normal
            contact.ni.negate(contactNormal);
        else
            contactNormal.copy(contact.ni); // bi is something else. Keep the normal as it is

        // Like, a lot of the code needs access to the player.

        // entity.js makes the player, scene.js adds it to the scene so you can see it,

        // world.js enables physics for  it, and plenty of other files need realtime data on how much

        // hp it has, etc.  So, its obvious a lot of files need access to the player.  Instead of constantly

        // sending messages to other files with new player data (waaaay confusing), we just plop it in G,

        // which everything has access to - plus, G updates the player for all other files whenever its

        // changed in one.  Its like this with a lot of other stuff besides the player too, for

        // example the camera you see out of, the scene everythings placed in, etc.

        // G (stands for globals) is basically just a convenience we set up so we didnt have to go through

        // a bunch of extra hastle.

        // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
        if (contactNormal.dot(upAxis) > 0.5) { // Use a "good" threshold value between 0 and 1 here!
            canJump = true;
        }
    });

    var velocity = cannonBody.velocity;

    var PI_2 = Math.PI / 2;

    var onMouseMove = function(event) {

        if (scope.enabled === false) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));

        G.get('events').publish('player.look', {
            pitch: pitchObject.rotation,
            yaw: yawObject.rotation
        }); // the events library :)
    };

    var onKeyDown = function(event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = true;
                G.get('events').publish('player.move', {});
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                G.get('events').publish('player.move', {});
                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                G.get('events').publish('player.move', {});
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                G.get('events').publish('player.move', {});
                break;

            case 32: // space
                if (canJump === true) {
                    velocity.y = jumpVelocity;
                    G.get('events').publish('player.jump', {});
                }
                canJump = false;
                break;
            case 16:
                isSprinting = true;
                break;
        }

    };

    var onKeyUp = function(event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // a
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;
            case 16:
                isSprinting = false;
                break;

        }

    };

    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('touchmove', onMouseMove, false);
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    this.enabled = false;

    this.getObject = function() {
        return yawObject;
    };

    this.getDirection = function(targetVec) {
        targetVec.set(0, 0, -1);
        quat.multiplyVector3(targetVec);
    };

    // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
    var inputVelocity = new THREE.Vector3();
    var euler = new THREE.Euler();
    this.update = function(delta) {

        if (scope.enabled === false) return;

        delta *= 0.1;

        inputVelocity.set(0, 0, 0);

        let velocFactor = G.get('player').spd;

        if (isSprinting &&
            G.get('player').stm > 0 &&
            (moveForward || moveBackward || moveLeft || moveRight)) {
            velocFactor *= 2;
            G.get('player').stm -= 0.2;
            G.get('player').lastUsedStamina = Date.now();
        }

        if (moveForward) {
            inputVelocity.z = -velocFactor * delta;
        }
        if (moveBackward) {
            inputVelocity.z = velocFactor * delta;
        }

        if (moveLeft) {
            inputVelocity.x = -velocFactor * delta;
        }
        if (moveRight) {
            inputVelocity.x = velocFactor * delta;
        }

        // I don't know why, but uncommenting the following line
        // makes you float...
        // euler.x = pitchObject.rotation.x;
        euler.y = yawObject.rotation.y;
        euler.order = "XYZ";
        quat.setFromEuler(euler);
        inputVelocity.applyQuaternion(quat);
        //quat.multiplyVector3(inputVelocity);

        // Add to the object
        velocity.x += inputVelocity.x;
        velocity.z += inputVelocity.z;

        if ((Math.abs(velocity.x) > 4 || Math.abs(velocity.z) > 4) &&
            canJump &&
            (moveForward || moveBackward || moveLeft || moveRight)) footstep.play();
        else if (!(moveForward || moveBackward || moveLeft || moveRight) && canJump) {
            velocity.x *= 0.675;
            velocity.z *= 0.675;
        }

        yawObject.position.copy(cannonBody.position);
    };
};
