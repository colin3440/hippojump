 ig.module(
    'plugins.debug.MyDebugPanel'
)
.requires(
    'impact.debug.menu',
    'impact.entity',
    'impact.game'
)
.defines(function(){
// code from impact js forum  http://impactjs.com/documentation/debug
// Overwrite the Game's loadLevel() method to call a custom method
// on our panel, after the level is loaded
ig.Game.inject({
    loadLevel: function( data ) {
        this.parent(data);  
        // 'fancypanel' is the name we give this panel in the
        // call to ig.debug.addPanel()
        ig.debug.panels.fancypanel.load(this);
    }
});
// Overwrite the Entity's update() method, so we can disable updating
// for a particular entity at a time
ig.Entity.inject({
    //property _shouldUpdate will store whether you want a certain entity to use its' update cyclus or not
    //the update function is rebuild using the inject technique
    //if the value of shouldUpdate is true : the update method must be executed.
    //if false: skip what is inside the update method
    _shouldUpdate: true,
    update: function() {
        if( this._shouldUpdate ) {
            this.parent();
        }
    }
});
MyFancyDebugPanel = ig.DebugPanel.extend({
    init: function( name, label ) {
        // This creates the DIV container for this panel
        this.parent( name, label ); 
        // You may want to load and use jQuery here, instead of 
        // dealing with the DOM directly...
        this.container.innerHTML = '<em>Entities not loaded yet.</em>';
    },
    load: function( game ) {
        // This function is called through the loadLevel() method
        // we injected into ig.Game   
        // Clear this panel
        this.container.innerHTML = '';  
        // Find all named entities and add an option to disable
        // the movement and animation update for it
        for( var i = 0; i < game.entities.length; i++ ) {
            var ent = game.entities[i];
            if( ent.name ) {
                var opt = new ig.DebugOption( 'Entity ' + ent.name, ent, '_shouldUpdate' );
                this.addOption( opt );
                this.container.appendChild(document.createTextNode('health: ' + ent.name + ' :' +ent.health));
               
            }
        }
        
    },
    ready: function() {
        // This function is automatically called when a new Game is created.
        // ig.game is valid here!
    },  
    beforeRun: function() {
        // This function is automatically called BEFORE each frame 
        // is processed.
    },
    afterRun: function() {      
        // This function is automatically called AFTER each frame 
        // is processed.
    }
    
});
ig.debug.addPanel({
    type: MyFancyDebugPanel,
    name: 'fancypanel',
    label: 'Fancy Panel'
});
});