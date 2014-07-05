ig.module('game.entities.bullet')
	.requires(
		'impact.entity'
	)
	.defines(function() {
		EntityBullet = ig.Entity.extend({
			name: 'bullet',
			size: {x: 5, y: 2},
			lifetime: 1.5,
			animSheet: new ig.AnimationSheet('media/bullet.png', 5, 2),
			checkAgainst: ig.Entity.TYPE.A,
			maxVel: {x: 1000, y: 0},
			type: ig.Entity.TYPE.B,
			gravityFactor: 0,

			velocity: 100,
			direction: -1,

			init: function(x, y , settings) {
				this.timerDecay = new ig.Timer( 1.5 );
				this.parent(x,y,settings);
				this.addAnim('idle', 1, [0]);
				this.vel.x = this.velocity * this.direction;
			},

			update: function() {
				if(this.timerDecay.delta() > 0) {
					this.kill();
				}

				if((this.vel.x <= this.direction && this.direction > 0) || (this.vel.x >= this.direction && this.direction < 0)) {
					this.kill();
				}
				this.parent();
			},

			check: function(other) {
				if(other.name == "hippo") {
					other.receiveDamage(10, this);
				}
				this.kill();
				this.parent();
				
			}
		});
	});