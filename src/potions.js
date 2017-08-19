// Potions mothafucka, too bad theres no "Make Nancy Go Out With Seth" potion

var globals /* or G for short */ = require('globals');

var player = globals.get('player');

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


// STAMINA POTIONS

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

// Medium
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

// Large
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

// Small 
var MPotionSM = 0;

/* player.inv.push({
   name: "Small Draught of Magic" ,
   id: "mpotionsm", 
   path: "/assets/icons/magic-potion.png",
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

// Large
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








