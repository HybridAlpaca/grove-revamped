// Potions mothafucka, too bad theres no "Make Nancy Go Out With Seth" potion

var globals /* or G for short */ = require('globals');

var player = globals.get('player'),
items = require('./json/items');

// HEALTH POTIONS

// Small.. TITSSSSSSSS
var HPotionSM = 0;
for (var i = 0; i < 0; i++) {
 player.inv.push({
   name: "Small Draught of Health" ,
   id: "hpotionsm",
   path: "/assets/icons/health-potion.png",
   desc: "cuz fuck it",
   effects: {
       "hp": 5
   }
}); }

// Medium.. NOSEEEEEEE
var HPotionMD = 0;

/* player.inv.push({
   name: "Medium Draught of Health" ,
   id: "hpotionmd",
   path: "/assets/icons/health-potion.png",
   desc: "cuz fuck it",
   effects: {
       "hp": 10
   }
}); */

// Large.. DICKKKKKK
var HPotionLG = 1;

/* player.inv.push({
   name: "Large Draught of Health" ,
   id: "hpotionlg",
   path: "/assets/icons/health-potion.png",
   desc: "cuz fuck it",
   effects: {
       "hp": 15
   }
}); */

// Uses small HP Potion
var UseHPotionSM = function(HPSM) {
    HPotionSM--;
    player.hp += 5;
};

// Uses medium HP potion
var UseHPotionMD = function(HPMD) {
    HPotionMD--;
    player.hp += 10;
};

// Uses large HP Potion
var UseHPotionLG = function(HPLG) {
    HPotionLG--;
    player.hp += 15;
};


// STAMINA POTIONS, Argh Fuckkkk

// Small 
var SPotionSM = 1;

/* player.inv.push({
   name: "Small Draught of Stamina" ,
   id: "spotionsm",
   path: "/assets/icons/stamina-potion.png",
   desc: "cuz fuck it all",
   effects: {
       "stm": 5
   }
}); */

// Medium... OrAnGe ShIt
var SPotionMD = 0;

/* player.inv.push({
   name: "Medium Draught of Stamina" ,
   id: "spotionmd", 
   path: "/assets/icons/stamina-potion.png",
   desc: "cuz fuck it all",
   effects: {
       "stm": 10
   } 
}); */

// Large... Hunter Noooooooises
var SPotionLG = 0;

/* player.inv.push({
   name: "Large Draught of Stamina" ,
   id: "spotionlg", 
   path: "/assets/icons/stamina-potion.png",
   desc: "cuz fuck it all",
   effects: {
       "stm": 15
   } 
}); */

// Uses small Stamina Potion
var UseSTPotionSM = function(STSM) {
    SPotionSM--;
    player.stm += 5;
};

// Uses medium Stamina Potion
var UseSTPotionMD = function(STMD) {
    SPotionMD--;
    player.stm += 10;
};

// Uses large Stamina Potion
var UseSTPotionLG = function(STLG) {
    SPotionLG--;
    player.stm += 15;
};


// MAGIC POTIONS

// Small... like Nancy's love for Seth, wait, that would be non-existent, oops
var MPotionSM = 0;

/* player.inv.push({
   name: "Small Draught of Magic" ,
   id: "mpotionsm", 
   path: "/assets/icons/mana-potion.png",
   desc: "cuz fuck it all",
   effects: {
       "mp": 5  
   } 
}); */

// Medium 
var MPotionMD = 0;

/* player.inv.push({
   name: "Medium Draught of Magic" ,
   id: "mpotionmd", 
   path: "/assets/icons/magic-potion.png",
   desc: "cuz fuck it all",
   effects: {
       "mp": 10
   } 
}); */

// Large... FRAPPLE ZAPPLE
var MPotionLG = 0;

/* player.inv.push({
   name: "Large Draught of Magic" ,
   id: "mpotionlg", 
   path: "/assets/icons/magic-potion.png",
   desc: "cuz fuck it all",
   effects: {
       "mp": 15
   } 
}); */

// Uses small Magic Potion
var UseMAPotionSM = function (MASM) {
    MPotionSM--;
    player.mp += 5;
};

// Uses medium Magic Potion
var UseMAPotionMD = function (MAMD) {
    MPotionMD--;
    player.mp += 10;
};

// Uses large Magic Potion
var UseMAPotionLG = function (MALG) {
    MPotionLG--;
    player.mp += 15;
};


// POISONS, AND THERE ARE A HELLA LOT OF THEM

var weakHPPoison = 0; // Weak Health Poison - Damages Health, 5 points of DMG, lasts 5 seconds

var useWeakHPPoison = function (WHPP) {
    weakHPPoison--;
    for (var i=0; i<5; i++) {
        player.dmg += 5;
    }
};
player.inv.push(items['whpoison']);

var weakSTPotion = 0; // Weak Stamina Poison - Damagges Stamina, 5 points of DMG, lasts 5 seconds

var weakMAPotion = 0; // Weak Magic Poison - Damages Magic, 5 points of DMG

var HPPoison = 0; // Health Poison - Damages Health, 10 points of DMG

var STPotion = 0; // Stamina Poison - Damagges Stamina, 10 points of DMG

var MAPotion = 0; // Magic Poison - Damages Magic, 10 points of DMG

var strongHPPoison = 0; // Strong Health Poison - Damages Health, 15 points of DMG

var strongSTPotion = 0; // Strong Stamina Poison - Damagges Stamina, 15 points of DMG

var strongMAPotion = 0; // Strong Magic Poison - Damages Magic, 15 points of DMG

var fucksBane = 0; // ThIs Is A vErY rArE pOsIoN tAkEn FrOm ThE lEgEnDaRy BuTtBoOk. It DoEs AlL oF tHe DaMaGeS - 25 points of DMG

var wolfsBane = 0; // A poison that does a moderate amount of HP damage, why is it named Wolf's Bane though? - 20 points of DMG

var cyanide = 0; // Because of course there needs to be SOME modern poisons - 30 points of DMG

var arsenic = 0; // Fuck it, why not - 30 points of DMG

var hellaStrongAFGodPoison = 0; // Hell yeah, bitch! This is pretty fuckin' rare, and it does a shit ton of damage to health, stamina and magic.
// 100,000,000,000 points of DMG cause fuck yeah!
/* for (var i = 0; i < 5; i++) {
    player.inv.push({
   name: "Hella Strong As Fuck God Poison" ,
   id: "hsafgpoison", 
   path: "/assets/icons/health-poison.png",
   type: "poison", // set it's type to poison for future use
   desc: "cuz fuck it all",
   effects: {
       "hp": -100000000000
   } 
});
  } */ // So you don't start with 5 of the best poisons in the game.

var trollPotion = 0; // The player thinks this is a beneficial potion, but it is actually a strong poison, BWAHAHA
