'use strict';

const CANNON = require('cannon');

let G = require('globals'),
    world = G.get('world');

module.exports = () => {
    // Setup our world
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    var solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    var split = true;
    if (split)
        world.solver = new CANNON.SplitSolver(solver);
    else
        world.solver = solver;

    world.gravity.set(0, -20, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create a slippery material (friction coefficient = 0.0)
    var physicsMaterial = new CANNON.Material("slipperyMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
        physicsMaterial,
        0.0, // friction coefficient
        0.3 // restitution
    );
    // We must add the contact materials to the world
    world.addContactMaterial(physicsContactMaterial);

    // Create a sphere
    var mass = 5,
        radius = 1.3;
    var sphereShape = new CANNON.Sphere(radius);
    G.set('sphereBody', new CANNON.Body({
        mass: mass
    }));
    G.get('sphereBody').addShape(sphereShape);
    G.get('sphereBody').position.set(0, 10, 0);
    G.get('sphereBody').linearDamping = 0.9;
    world.add(G.get('sphereBody'));

};
