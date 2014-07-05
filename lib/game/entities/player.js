ig.module('game.entities.player')
.requires(
    'impact.entity'
)
.defines(function() {
    EntityPlayer = ig.Entity.extend({
        // MAIN SETTINGS
        size: {x: 47, y: 20},
        animSheet: new ig.AnimationSheet( 'media/hippos.png', 47, 20 ),
        health: 100,
        flipx: false,
        flipy: false,
        name: 'hippo',
        enemies: ['poacher'],

        // MOVEMENT SETTINGS
        walktime: 0,
        walk: 0,
        drop: false,
        jump: false,
        accelx: 1,
        slow: 10,
        maxVel: {x: 100, y: 500},
        jumpmax: 1,
        jumpheight: 90,
        speed: 10,
        gravityFactor: 1,

        // COLLISION SETTINGS
        type: ig.Entity.TYPE.A,
        checkAgainst: ig.Entity.TYPE.B,
        collides: ig.Entity.COLLIDES.ACTIVE,
        launchX: 100,
        launchY: 100,
        
        init: function( x, y, settings ) {
            this.parent( x, y, settings );

            // add the animations
            this.addAnim( 'idle', 1, [1], true );
            this.addAnim( 'walk', 0.3, [0, 2] );
            this.addAnim( 'jump', 1, [3], true );
            this.addAnim( 'drop', 1, [1], true );

            this.currentAnim = this.anims.idle;
            this.movement = new this.getMovement();
            this.attack = new this.getAttack();
        },
        
        update: function() {
            this.walk = this.drop = this.jump = 0;
            this.walk = (ig.input.state('left')) ? -1 : this.walk;
            this.walk = (ig.input.state('right')) ? 1 : this.walk;
            this.drop = (ig.input.state('drop')) ? true : this.drop;
            this.jump = (ig.input.pressed('jump')) ? true : this.jump;

            for (var i in this.movement) {
                var command = this.movement[i]();
                if(command) {
                    break;
                }
            }

            this.parent();
        },

        check: function(other) {
            for (var i in this.attack) {
                var command = this.attack[i](other);
                if(command) {
                    break;
                }
            }
        },

        getAttack: function() {
            this.init = function(other) {
                sign = Math.abs(other.pos.x-player.pos.x)/(other.pos.x-player.pos.x);
                launchX = launchOrigX = player.launchX*sign;
                launchY = player.launchY;
                damage = Math.round(player.movetime*1);
                player = ig.game.getEntitiesByType('EntityPlayer')[0];
            }
            this.check_launched = function(other) {
                if(other.launch) {
                    other.collides = ig.Entity.COLLIDES.NONE;
                    return true;
                } else {
                    other.collides = ig.Entity.COLLIDES.LITE;
                }
            }
            this.check_enemy = function(other) {
                var enemies = player.enemies;
                if(enemies.indexOf(other.name) == -1) {
                    return true;
                }
            }
            this.check_jump = function(other) {
                if(other.pos.y-player.pos.y > 1) {
                    damage = 50;
                    launchX += 150;
                    launchOrigX += 150;
                }
            }
            this.check_drop = function() {
                if(player.drop) {
                    damage = 200;
                    launchX = launchOrigX = 2000;
                    launchY = -500;
                }
            }
            this.update = function(other) {
                other.receiveDamage(damage, player);
                other.launch = true;
                other.launchX = launchX;
                other.peakY = launchY;
                other.startX = other.pos.x;
                other.startY = other.pos.y;
                other.durationY = 0;
                other.durationEndY = 100;
                player.vel.x = 0;
            }
            return false;
        },

        getMovement: function() {
            this.init = function() {
                player = ig.game.getEntitiesByType('EntityPlayer')[0];
                s = player.lastdirection;

                vel = player.vel;
                flipy = false;
                currentAnim = player.anims.idle;
                gravityFactor = 1;
            }
            this.check_turn = function() {
                if(player.lastdirection != player.walk && player.walk != 0) {
                    vel.x = 0;
                    player.movetime = 0;
                }
            }
            this.check_walk = function() {
                var velx = (player.movetime*player.accelx)+player.speed;
                if(player.walk != 0) {
                    player.movetime++;
                    player.lastdirection = player.walk;
                    vel.x = player.walk*velx;

                    currentAnim = player.anims.walk;
                }
                else if(vel.x != 0 && player.movetime > 0) {
                    player.movetime -= player.lastdirection*player.slow;
                    vel.x = player.walk*velx;
                }
                else if(player.movetime < 0) {
                    player.movetime = 0;
                }
            }
            this.check_standing = function() {
                if(player.standing) {
                    player.drop = false;
                    player.jumpmax = 1;
                } else {
                    currentAnim = player.anims.jump;
                }
            }
            this.check_jump = function() {
                if(player.jump && player.jumpmax > 0) {
                    vel.y = -player.jumpheight;
                    player.jumpmax--;
                    player.movetime--;

                    currentAnim = player.anims.jump;
                }
            }
            this.check_drop = function() {
                if(player.drop) {
                    currentAnim = player.anims.drop;
                    gravityFactor = 100;
                    flipy = true;
                }
            }
            this.update = function() {
                player.vel = vel;
                player.currentAnim.flip.y = flipy;
                player.currentAnim = currentAnim;
                player.currentAnim.flip.x = (player.lastdirection > 0) ? false : true;
                player.gravityFactor = gravityFactor;
            }
        },

        handleMovementTrace: function( res ){
            this.parent( res );

            //if standing on slope and no key press
            //stop all movement
            if( res.collision.slope && this.standing && this.noKeyPress()){
                this.pos.x = this.last.x;
                this.pos.y = this.last.y;
                this.vel.x = 0;
                this.vel.y = 0;
            }
        },

        noKeyPress: function(){
            var actions = ig.input.actions;
            for( var action in actions ){
                if( actions[action] ){
                    return false;
                }
            }
            var presses = ig.input.presses;
            for( var press in presses ){
                if( presses[press] ){
                    return false;
                }
            }
            return true;
        },

        kill: function() {
            ig.game.gameOver();
        }
    });
});