ig.module('game.entities.enemy')
	.requires(
		'impact.entity',
		'plugins.spawnlocations'
	)
	.defines(function() {
		EntityHealth = ig.Entity.extend({
			size: {x:20, y: 2},
			animSheet: new ig.AnimationSheet('media/health.png', 20, 2),
			gravityFactor: 0,
			healthw: 20,

			init: function(x,y,settings) {
				this.zIndex = 1000;
				this.addAnim('idle', 1, [0]);
				this.parent(x,y,settings);
			},

			update: function() {
				this.parent();
			}
		}),

		EntityEnemy = ig.Entity.extend({
			canvas : document.getElementById('canvas'),
			size: {x:7, y: 30},
			offset: {x:10, y: 0},
			name: 'poacher',
			health: 200,
			healthStart: 200,
			bounciness: 0,
			animSheet: new ig.AnimationSheet('media/poacher.png', 28, 30),
			speed: 30,
			shootRange: {max: 150, min: 60},
			shootRangePerm: {max: 150, min: 60},
			lastdirection: 1,
			godirection: 1,
			moveProx: 0,

			// LAUNCH DEFAULTS
			launch: false,
			launchFriction: 30,
			launchBounce: 1,

			collides: ig.Entity.COLLIDES.LITE,
			type: ig.Entity.TYPE.B,

			init: function(x, y , settings) {
				this.parent(x,y,settings);
				
				this.addAnim('idle', 1, [0]);
				this.addAnim('walk', .2, [4, 3, 2]);
				this.addAnim('shoot', 1, [1]);
				this.addAnim('run', .1, [5, 6]);

				this.action = new this.getAction(this.id);
				this.health = GameInfo.enemyHealth;
				this.healthStart = GameInfo.enemyHealth;
				this.healthleft = this.showHealth();
			},

			update: function() {
				this.healthleft.pos.x = this.pos.x-(Math.round(this.size.x/2))-2;
				this.healthleft.pos.y = this.pos.y-4;
				this.bottom = this.pos.y+this.size.y+1;
				for (var i in this.action) {
					var command = this.action[i]();
					if(command) {
						this.doAction(command.action, command.sign);
						if(command.sign != 0) {
							this.godirection = command.sign;
						}
						break;
					}
				}
				this.parent();
			},

			receiveDamage: function(amount, from) {
				this.parent(amount, from);

				var healthw = Math.round((this.health/this.healthStart)*20);
				this.healthleft.animSheet.width = healthw;
			},

			draw:function(){
			  this.parent();// defaults
			},

			getAction: function(enemyid) {
				this.init = function() {
					player = ig.game.getEntitiesByType('EntityPlayer')[0];
					enemies = ig.game.getEntitiesByType('EntityEnemy');
					for (var i in enemies) {
						if(enemies[i].id == enemyid) {
							enemy = enemies[i];
							break;
						}
					}

					dx = Math.round(enemy.pos.x-player.pos.x);
					dy = Math.round(enemy.pos.y-player.pos.y);
					s = Math.abs(dx)/dx;
					enemy.godirection = enemy.lastdirection;

					// check surroundings
					var right = enemy.pos.x+enemy.size.x+1;
					var left = enemy.pos.x-1;
					var nextx = (enemy.godirection < 0) ? left : right;
					var prevx = (enemy.godirection < 0) ? right : left;

					var prevtile = ig.game.collisionMap.getTile(prevx, enemy.bottom-4);
					var nexttile = ig.game.collisionMap.getTile(nextx, enemy.bottom-4);
					enemy.wall = (prevtile != 0 || nexttile != 0) ? true : false;
					enemy.wallNext = (nexttile != 0) ? true : false;
					enemy.wall = (prevtile != 0 && nexttile != 0) ? false : enemy.wall; // wall on both sides means you're going through a floor not against a wall

					var prevstep = ig.game.collisionMap.getTile(prevx, enemy.bottom);
					var nextstep = ig.game.collisionMap.getTile(nextx, enemy.bottom);
					enemy.ledge = (nextstep == 0) ? true : false;
					enemy.ledgeBack = (prevstep == 0) ? true : false;

					// check cornered
					enemy.cornered = false;
					if(Math.abs(dx) <= enemy.shootRange.max && (enemy.ledge || enemy.wall || enemy.ledgeBack)) {
						enemy.cornered = true;
					}

					if(enemy.cornered) { // if cornered, stand and fight
						enemy.shootRange.min = 0;
					} else {
						enemy.shootRange = {max: 150, min: 60};
					}
				}

				this.check_Launch = function() {
					if(enemy.launch) {
						return {action:'Launch'};
					}
				}

				this.check_Falling = function() {
					if(!enemy.standing) {
						return {action:'Fall'}
					}
				}

				this.check_Patrol = function() {
					if(Math.abs(dy) > 15) {
						if(!enemy.wallNext && !enemy.ledge) {
							return {action:'Move'};
						} else if(enemy.wallNext || enemy.ledge) {
							enemy.godirection *= -1; // flip at wall or ledge
							return {action:'Move'};
						}
					}
				}

				this.check_Prox = function() {
					if(enemy.moveProx != 0 && Math.abs(dx) != Math.abs(enemy.moveProx) && !enemy.cornered) {
						if(Math.abs(dx) > Math.abs(enemy.moveProx)) { // if moving toward, walk
							enemy.godirection = -1*s;
							return {action:'Move'};
						}
						else { // if moving away, run
							enemy.godirection = s;
							return {action:'Run'};
						}
					}
					else {
						enemy.moveProx = 0;
					}
				}

				this.check_Tooclose = function() {
					if(Math.abs(dx) <= enemy.shootRange.min) {
						enemy.moveProx = enemy.shootRange.min+30;
					}
				}

				this.check_Far = function() {
					if(Math.abs(dx) >= enemy.shootRange.max && Math.abs(dx) < 300) {
						enemy.moveProx = enemy.shootRange.max-10;
						
					}
				}

				this.check_Shoot = function() {
					var fire = (Math.random() < GameInfo.shootChance) ? true : false;
					if(Math.abs(dx) < enemy.shootRange.max && Math.abs(dx) > enemy.shootRange.min && Math.abs(dy) <= 15) {
						enemy.godirection = -1*s;
						if(fire) {
							return {action:'Shoot'};
						} else {
							return {action:'ShootWait'};
						}
					}
				}

				this.check_Idle = function() {
					return {action:'Idle'};
				}

				return false;
			},

			doAction: function(action) {
				if(this.godirection != 0) {
					if(this.godirection < 0) {
						var flipx = false;
					} else if(this.godirection > 0) {
						var flipx = true;
					}
					this.currentAnim.flip.x = flipx;
					this.lastdirection = this.godirection;
				}
  	    		switch(action) {
					case 'Idle':
						this.currentAnim = this.anims.idle;
						this.vel.x = 0;
						break;

					case 'Move':
						this.currentAnim = this.anims.walk;
						this.vel.x = this.godirection * this.speed;
						break;

					case 'Run':
						this.currentAnim = this.anims.run;
						this.vel.x = (this.godirection*this.speed)+(20*this.godirection);
						break;

					case 'Shoot':
						this.currentAnim = this.anims.shoot;
						ig.game.spawnEntity('EntityBullet', this.pos.x, this.pos.y+10, {direction: this.godirection});
						this.vel.x = 0;
						break;

					case 'ShootWait':
						this.currentAnim = this.anims.shoot;
						this.vel.x = 0;
						break;

					case 'Fall':
						this.currentAnim = this.anims.run;
						break;

					case 'Launch':
						var arc = this.arcSim(this.launchX, this.peakY, this.durationY, this.durationEndY); // get arc calculations

						if(this.launch) { // still flying keep moving x
							this.vel.x = arc.launchX;
							this.launchX = arc.launchX;
							this.vel.y = arc.velY;
							this.currentAnim = this.anims.run;
							this.durationY = arc.durationY;
						} else {
							this.vel.x = 0;
							this.vel.y = 0;
						}
						break;

					default:
						this.currentAnim = this.anims.idle;
						this.vel.x = 0;
						this.vel.y = 0;
						break;
				}
	  	    },

			check: function(other) {
				this.parent();
			},

			arcSim: function(launchX, peakY, durationY, durationEndY) {
				var velY = this.vel.y;
				if(durationY < durationEndY && (!this.standing || durationY < durationEndY/2)) { // not done
					var change = (durationY-(durationEndY/2))/(durationEndY/2);
					if(durationY < durationEndY/2) {
						var change = (1-(durationY/(durationEndY/2)))*-1;
					}
					velY = peakY*change;
				}
				else if(this.standing) {
					this.launch = false;
				}

				if(this.launchBounce > 0 && this.wall) { // check bounce
					launchX *= -this.launchBounce;
				}

				durationY += 1;
				return {'launchX':launchX, 'durationY':durationY, 'velY':velY};
			},

			showHealth: function() {
				return ig.game.spawnEntity('EntityHealth', 0, 0);
			},

			kill: function() {
				GameInfo.score += 100;

				// more enemies each kill
				var enemyCount = 2;
				var enemyTotal = ig.game.getEntitiesByType('EntityEnemy').length;
				GameInfo.shootChance = enemyTotal*0.005;
				GameInfo.enemyHealth = enemyTotal*25+200;

				var player = ig.game.getEntitiesByType('EntityPlayer')[0];
				player.jumpheight += 5;
				player.jumpmax += Math.round(enemyTotal/10);
				player.health += 15;

				if(GameInfo.shootChance > 0.6) {
					GameInfo.shootChance = 0.6;
				}

				var mapWidth = ig.game.collisionMap.pxWidth-20;
				var mapHeight = ig.game.collisionMap.pxWidth;

				if(enemyTotal >= 6) {
					var y = 200;
				}
				else {
					var y = 290;
				}

				var spawn = new ig.spawnlocations();
				var makeEnemies = (GameInfo.score > 400) ? 4 : Math.floor(GameInfo.score/100);
				for(i=makeEnemies; i>0; i--) {
					var randx = Math.floor(Math.random() * mapWidth)+20;
					spawn.spawnIf(randx,y);
				}

				this.healthleft.kill();
				this.parent();
			}
		});
	});