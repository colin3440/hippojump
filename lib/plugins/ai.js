ig.module('plugins.ai')
	.defines(function() {
		ig.ai = ig.Class.extend({
			goTill: 0,
			init: function(entity) {
				// holds commands the AI can send
				ig.ai.ACTION = {
					Rest:0, Move:1, Shoot:2
				};
				this.entity = entity;
			},
	  	    getAction: function(entity){
	  	    	this.entity = entity;
	  	    	var player = ig.game.getEntitiesByType('EntityPlayer')[0];

				var distanceX = this.entity.pos.x-player.pos.x;
				var distanceY = this.entity.pos.y-player.pos.y;
				var sign = Math.abs(distanceX)/distanceX;

				this.entity.bounciness = 0;
				this.entity.maxVel.x = 100;
				this.entity.maxVel.y = 100;
				if(this.goTill > 0) {
					if(distanceX < 0 && distanceX < this.goTill) {
						return this.doAction(ig.ai.ACTION.Move, '-1');
					} else if(distanceX < this.goTill) {
						return this.doAction(ig.ai.ACTION.Move, '1');
					} else {
						this.goTill = 0;
					}
				} else {
					if(Math.abs(distanceX) > 130 && Math.abs(distanceX) < 300) {
						if(distanceX < 0) {
							return this.doAction(ig.ai.ACTION.Move, '1');
						} else {
							return this.doAction(ig.ai.ACTION.Move, '-1');
						}
					}
					else if(Math.abs(distanceX) <= 100) {
						if(distanceX < 0) {
							return this.doAction(ig.ai.ACTION.Move, '-1');
						} else {
							return this.doAction(ig.ai.ACTION.Move, '1');
						}
					}
					else {
						var fire = Math.random() < 0.01;
						if(fire && distanceY <= 25 && distanceY > -25) {
							if(distanceX < 0) {
								return this.doAction(ig.ai.ACTION.Shoot, '1');
							} else {
								return this.doAction(ig.ai.ACTION.Shoot, '-1');
							}
						} else {
							if(distanceX < 0) {
								return this.doAction(ig.ai.ACTION.ShootWait, '1');
							} else {
								return this.doAction(ig.ai.ACTION.ShootWait, '-1');
							}
						}
					}
				}
	  	    },

	  	    doAction: function( action, flip ) {
	  	    	this.lastAction = action;
	  	    	return ({'action': action, 'flip': flip});
	  	    }
		});
	});