ig.module( 
	'game.main' 
)
.requires(
    'impact.debug.debug',
	'impact.game',
	'impact.font',
    'game.entities.player',
    'game.entities.enemy',
    'game.entities.bullet',
    'game.levels.area1',
    'plugins.hud',
    'plugins.debug.MyDebugPanel',
    'plugins.spawnlocations'
)
.defines(function(){

    //
    // --------------------------------------------------------------------------
    // The Game Info
    // --------------------------------------------------------------------------
    //
    GameInfo = new function() {
        this.score = 0;
        this.shootChance = 0.005;
        this.enemyHealth = 200;
    },

    //
    // --------------------------------------------------------------------------
    // The Game Stage
    // --------------------------------------------------------------------------
    //
    HippoJump = ig.Game.extend({
        font: new ig.Font( 'media/04b03.font.png' ),
        hud: new ig.hud(),
        gravity: 100,
        clearColor: "#00bbf2",

        // initialize your game here
        init: function() {            
            // bind keys
            ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
            ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
            ig.input.bind( ig.KEY.DOWN_ARROW, 'drop' );
            ig.input.bind( ig.KEY.UP_ARROW, 'jump' );
            GameInfo.score = 0;
            GameInfo.shootChance = 0.005;
            this.enemyHealth = 200;
            
            this.loadLevel( LevelArea1 );
        },
        
        update: function() {
            this.parent();
            
            var player = this.getEntitiesByType(EntityPlayer)[0];
            if(player) {
                this.screen.x = player.pos.x - ig.system.width/2;
                this.screen.y = player.pos.y - ig.system.height/2;
            }
        },

        gameOver: function() {
            ig.system.setGame(gameOver);
        }
    });

    gameOver = ig.Game.extend({
        gameOverImage : new ig.Image('media/GameOver.png'),

        init: function(){
            ig.input.bind(ig.KEY.SPACE,'LoadGame');
        },

        update: function(){
            if(ig.input.pressed('LoadGame')){
                ig.system.setGame(HippoJump);
            }
        },

        draw: function() {
            this.parent();
            this.gameOverImage.draw(0,0);
        }
    });
    
    //
    // --------------------------------------------------------------------------
    // Initialize the Game
    // --------------------------------------------------------------------------
    //
    ig.main( '#canvas', HippoJump, 60, 320, 240, 2 );
});
