'use strict';

// container definition

let structs = [];

// ADTs

structs.Entity = class Entity {
    constructor(type) {
        console.log(`« ${type || 'Entity'} Created »`);
    }
    update() {}
    remove() {}
};

// class declarations
