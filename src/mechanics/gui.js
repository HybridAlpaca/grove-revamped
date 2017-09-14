"use strict";

const G = require('globals'),
    $ = require('jquery'),
    tippy = require('../threex/tippy.min.js');

export default class GUI {
    constructor(title, content) {
        $('#gui-title').text(title);
        $('#gui-content').html(content);
        this.show();
        document.exitPointerLock();
    }

    show() {
        $('#gui').fadeIn(400);
    }

    hide() {
        $('#gui').fadeOut(400);
    }
}

export class Menu {
    constructor() {

        let menu = $('<div>').attr('id', 'menu');
        $('<h3>').attr('id', 'menu-levels').html('Character').click(() => new Character()).appendTo(menu);
        $('<h3>').attr('id', 'menu-magic').html('Magic').click(() => new Magic()).appendTo(menu);
        $('<h3>').attr('id', 'menu-inv').html('Inventory').click(() => new Inventory()).appendTo(menu);
        $('<h3>').attr('id', 'menu-options').html('Options').appendTo(menu);
        $('<div>').attr('id', 'menu-cross').appendTo(menu);

        new GUI('Menu', menu);
    }
}

export class Character {
    constructor() {

        new GUI(window.Grove.username || 'Character', '<p>TODO</p>');

    }
}

export class Inventory {
    constructor() {
        let data = G.get('player').inv;
        let div = $('<div>');
        for (let item of data) {
            (function() {
                let template = $('<div>');
                let img = $('<img>')
                    .addClass('inv-item')
                    .attr('src', item.path)
                    .attr('title', item.name)
                    .attr('width', 50)
                    .data('item', item)
                    .appendTo(div)
                template.html(`<b>${item.name}</b><br><hr><i>${item.desc}</i>`);
                let tip = new tippy(img[0], {
                    position: 'bottom',
                    html: template[0]
                });
                let popper = tip.getPopperElement(img[0]);
                popper.style.zIndex = 999999999999;
                popper.style.maxWidth = '150px';
            })();
        }
        div.on('click', 'img', function() {

            var item = $(this).data('item'); // ignore this part

            // hide icon
            $(this).hide();
            // remove from inventory
            G.get('player').inv.splice(G.get('player').inv.indexOf(item), 1);

            if (item.type == 'poison') {
                G.get('player').poisons.push(item); // add this to list of poisons player
                // has on their sword
                Materialize.toast('Your blade is now poisoned!', 700);
            }

            // do effects to player if it has them
            else if (item.effects)

                for (let key in $(this).data('item').effects) {

                    G.get('player')[key] += item.effects[key];

                }

        });

        new GUI('Inventory', div);

    }
}

export class Magic {
    constructor() {

        new GUI('Menu', '<p>TODO</p>');

    }
}

export class HUD {
    constructor() {

        this.canvas = document.getElementById('hud-canvas');
        this.canvas.setAttribute('width', window.innerWidth * 0.7);
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = 40;
        this.radiusSmall = 30;

        G.get('events').subscribe('system.update', this.draw.bind(this));

    }

    draw() {

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);


        // MANA BAR
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.centerX - this.radiusSmall - 15, this.canvas.height - this.radiusSmall - 15, this.radiusSmall, 0, 2 * Math.PI, false);
        this.ctx.clip();
        this.ctx.fillStyle = '#000080';
        this.ctx.fillRect(this.centerX - this.radiusSmall * 2 - 15, this.canvas.height - 15, this.radiusSmall * 2, -(G.get('player').mp / G.get('player').mpMax) * this.radiusSmall * 2);
        this.ctx.restore();

        // MANA BAR BORDER
        this.ctx.beginPath();
        this.ctx.arc(this.centerX - this.radiusSmall - 15, this.canvas.height - this.radiusSmall - 15, this.radiusSmall, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#000000';
        this.ctx.stroke();


        // STAMINA BAR
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.centerX + this.radiusSmall + 15, this.canvas.height - this.radiusSmall - 15, this.radiusSmall, 0, 2 * Math.PI, false);
        this.ctx.clip();
        this.ctx.fillStyle = '#006400';
        this.ctx.fillRect(this.centerX + 15, this.canvas.height - 15, this.radiusSmall * 2, -(G.get('player').stm / G.get('player').stmMax) * this.radiusSmall * 2);
        this.ctx.restore();

        // STAMINA BAR BORDER
        this.ctx.beginPath();
        this.ctx.arc(this.centerX + this.radiusSmall + 15, this.canvas.height - this.radiusSmall - 15, this.radiusSmall, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#000000';
        this.ctx.stroke();


        // HEALTH BAR
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.canvas.height - this.radius - 5, this.radius, 0, 2 * Math.PI, false);
        this.ctx.clip();
        this.ctx.fillStyle = '#cc0000';
        this.ctx.fillRect(this.centerX - this.radius, this.canvas.height - 5, this.radius * 2, -(G.get('player').hp / G.get('player').hpMax) * this.radius * 2);
        this.ctx.restore();

        // HEALTH BAR BORDER
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.canvas.height - this.radius - 5, this.radius, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = 6;
        this.ctx.strokeStyle = '#000000';
        this.ctx.stroke();


        // XP BAR
        let grd = this.ctx.createLinearGradient(0, 0, (G.get('player').xp / G.get('player').xpMax) * this.canvas.width, 0);
        grd.addColorStop(0, "darkgreen");
        grd.addColorStop(0.75, "darkgreen");
        grd.addColorStop(0.95, "lime");
        grd.addColorStop(1, "lime");
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, this.canvas.height - 10, (G.get('player').xp / G.get('player').xpMax) * this.canvas.width, 10);


        // HEALTH TEXT
        this.ctx.fillStyle = 'black';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${G.get('player').hp > 0 ? Math.floor(G.get('player').hp) : 0} HP`, this.centerX, this.canvas.height - this.radius);

    }
}

window.addEventListener('keypress', (e) => {
    if (e.keyCode == 80 || e.keyCode == 112)
        new Menu();
});

$(document).keyup((e) => {
    if (e.key.toLowerCase() == 'escape') $('#pause').show();
});
