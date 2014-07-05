ig.module('plugins.hud').
defines(function(){
	ig.hud = ig.Class.extend({ 
		canvas   : document.getElementById('canvas'),
		context  : canvas.getContext('2d'),
		score    : null,
		health   : null,
		maxHealth : 100,

		init: function(){
			ig.Game.inject({
				draw: function(){
					this.parent();

					// draw hud if there is a player
					if(ig.game.getEntitiesByType('EntityPlayer').length != 0){
						if (this.hud){
				    		this.hud.number();
				    	} 
					}
				}
			})
		}, 

		number: function(){ 
			if(!this.context) return null;

			var player =ig.game.getEntitiesByType('EntityPlayer')[0];

			// draw a transparant black rectangle 
			var context = this.canvas.getContext('2d');
			context.fillStyle = "rgb(0,0,0)";
			context.setAlpha(0.7); //set transparency 
			context.fillRect(10,10,100,70);

			//draw text on top of the rectangle 
			context.fillStyle = "rgb(255,255,255)";
			context.font = "15px Arial";
			context.fillText('Score: ' + GameInfo.score, 20, 30);
			context.fillText('Health: ' + player.health, 20, 50);
			context.fillText('Poachers: ' + ig.game.getEntitiesByType('EntityEnemy').length, 20, 70);

			//font used is the default canvas font
			context.setAlpha(1);
			return null;
		}
	});
});