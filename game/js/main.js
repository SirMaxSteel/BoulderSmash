var gameCanv;
var contextmenu;
var maps;

var selectedMapBlock;

var map;
var ctx;

var canvholder;

var Caves;

var scoreLabel, diamondsLabel, timerLabel;

var canvas;
var ctx;
var fullyLoaded = 0;
var currentScreen = 0; // 0 = Loading; 1 = Menu; 2 = Game; 3 = MapEditor; 4 = Community;
var themes = {
    1: "assets/test.png",
    2: "assets/test.png",
    3: "assets/test.png"
}
var activeTheme;
var tileSize;
var mapsLoaded = 0;


document.addEventListener('DOMContentLoaded', init, false);
window.addEventListener('resize', onResize, false);

function game(){

    window.onkeyup = keyUpHandler;
    gameCanv = document.getElementById('GameCanvas');
    canvholder = document.getElementById('GameCanvasHolder');

    var gamebar = document.getElementById('gamebar');
    var gamebarStyle = window.getComputedStyle(gamebar);

    scoreLabel = document.getElementById('scoreLabel');
    diamondsLabel = document.getElementById('diamondsLabel');
    timerLabel = document.getElementById('timerLabel');

    Caves = new Caves();

    registerPubEvent('mapsloaded', bdMapsLoaded, Caves);
    canvas = document.getElementById("gameCanvas");

    //TODO: set width and high of canvas

    if(canvas)
    {
        ctx = canvas.getContext("2d");

        document.addEventListener('contextmenu', function(event) 
        {
            if(clickInsideElement(event, 'gameCanvas'))
            {
                event.preventDefault();
                toggleContextMenuOn(contextmenu);
                positionContextMenu(event);
            }
            else
            {
                toggleContextMenuOff(contextmenu);
            }
        }, false);

        tileSize = ctx.canvas.clientWidth / 40;
    }

    loadMaps();

    draw();
    loadAssets();
}

if (!window.requestAnimationFrame) { 
    window.requestAnimationFrame = window.webkitRequestAnimationFrame || 
                                   window.mozRequestAnimationFrame    || 
                                   window.oRequestAnimationFrame      || 
                                   window.msRequestAnimationFrame     || 
                                   function(callback, element) {
                                     window.setTimeout(callback, 1000 / 60);
                                   }
  }

function bdMapsLoaded()
{
    mapsLoaded = 1;
    //Caves.loadMaps(maps);
    //Boulderdash();
}

// Load all pictures from themes into themes
function loadAssets(){
    var finished = 0;
    var max = 0;
    max += Object.keys(themes).length;
    for ( i = 1; i <= max; i++ ){
        finished++;
        var img = new Image();
        img.src = themes[i];
        img.addEventListener('load', function(){
            finished--;
        })
        themes[i] = img;
    }
    
    // Wait until all themes are completly loaded
    var checkFinished  = function(){
        if (finished == 0 && mapsLoaded === 1){
            currentScreen = 1;
        }
        else setTimeout(checkFinished, 500);
    }
    checkFinished();
}

function openMapSelection(event) {
    
        var okBtn = document.getElementById('btnMapSelectionOk');
        okBtn.setAttribute('disabled', '');
    
        modalMapSelection.style.display = 'block';
    }
    
    function closeModal(ev)
    {   
        modalMapSelection.style.display = 'none';
    };
    
    function openMap(ev) {
    
        var cMap = maps.firstOrDefault(x => x.name === ev.target.id);
    
        if(!cMap) //ok button was clicked 
        {
            cMap = maps.firstOrDefault(x => x.name === selectedMapBlock.id);
        }
    
        map = cMap;
    
        if(ctx)
        {
            ctx.clearRect(0, 0, gameCanv.width, gameCanv.height);
        }
    
    
        drawMap(ctx, cMap, false);
    
        closeModal(ev);
    
        return true;
    };

function draw(){
    switch(currentScreen){
        case 0:
            drawLoading();
            break;
        case 1:
            drawMenu();
            break;
        case 2:
            drawGame();
            break;
        case 3:
            drawMapEditor();
            break;
        case 4:
            drawCommunity();
            break;
    }
}

window.addEventListener('resize', onResize, false);

function onResize(){
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if(canvas.width/40 <= canvas.height/24){
        tileSize = Math.floor(canvas.width/40);
    }
    else{
        tileSize = Math.floor(canvas.height/24);
    }
    draw();
}

function drawLoading(){
    ctx.background = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '19pt Arial';
    ctx.textAlign = 'center';
    ctx.textBaseLine = 'middle';
    ctx.fillStyle = 'yellow';
    ctx.fillText('BoulderSmash', canvas.width/2, canvas.height/2);
}

function drawMenu(){
    console.log('test');
}

function drawGame(){
    var game = new Game();
}

function drawMapEditor(){
    console.log('test');
}

function drawCommunity(){
    console.log('test');
}

BoulderDash = function()
{
    var KEY = { ENTER: 13, ESC: 27, SPACE: 32, PAGEUP: 33, PAGEDOWN: 34, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, F: 70, W: 82, A: 65, S: 83, D: 68, E: 69, M: 77 };

    function random(min, max)       { return (min + (Math.random() * (max - min)));            };
    function randomInt(min, max)    { return Math.floor(random(min,max));                      };
    function randomChoice(choices)  { return choices[Math.round(random(0, choices.length-1))]; };

    var DIR  = { UP: 0, UPRIGHT: 1, RIGHT: 2, DOWNRIGHT: 3, DOWN: 4, DOWNLEFT: 5, LEFT: 6, UPLEFT: 7 };
    var DIRX = [     0,          1,        1,            1,       0,          -1,      -1,        -1 ];
    var DIRY = [    -1,         -1,        0,            1,       1,           1,       0,        -1 ];
  
    function rotateLeft(dir)  { return (dir-2) + (dir < 2 ? 8 : 0); };
    function rotateRight(dir) { return (dir+2) - (dir > 5 ? 8 : 0); };
    function horizontal(dir)  { return (dir === DIR.LEFT) || (dir === DIR.RIGHT); };
    function vertical(dir)    { return (dir === DIR.UP)   || (dir === DIR.DOWN);  };

    var OBJECT = {
        SPACE:             { code: 0x00, rounded: false, explodable: false, consumable: true,  sprite: { x: 0, y: 6                 }, flash: { x: 4, y: 0 } },
        DIRT:              { code: 0x01, rounded: false, explodable: false, consumable: true,  sprite: { x: 1, y: 7                 } },
        BRICKWALL:         { code: 0x02, rounded: true,  explodable: false, consumable: true,  sprite: { x: 3, y: 6                 } },
        MAGICWALL:         { code: 0x03, rounded: false, explodable: false, consumable: true,  sprite: { x: 4, y: 6,  f: 4, FPS: 20 } },
        PREOUTBOX:         { code: 0x04, update: 'this.updatePreOutbox(cell.p);', rounded: false, explodable: false, consumable: false, sprite: { x: 1, y: 6                 } },
        OUTBOX:            { code: 0x05, rounded: false, explodable: false, consumable: false, sprite: { x: 1, y: 6,  f: 2, FPS: 4  } },
        STEELWALL:         { code: 0x07, rounded: false, explodable: false, consumable: false, sprite: { x: 1, y: 6                 } },
        FIREFLY1:          { code: 0x08, update: 'this.updateFirefly(cell.p, DIR.LEFT);', rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 9,  f: 8, FPS: 20 } },
        FIREFLY2:          { code: 0x09, update: 'this.updateFirefly(cell.p, DIR.UP);', rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 9,  f: 8, FPS: 20 } },
        FIREFLY3:          { code: 0x0A, update: 'this.updateFirefly(cell.p, DIR.RIGHT);', rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 9,  f: 8, FPS: 20 } },
        FIREFLY4:          { code: 0x0B, update: 'this.updateFirefly(cell.p, DIR.DOWN);', rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 9,  f: 8, FPS: 20 } },
        BOULDER:           { code: 0x10, update: 'this.updateBoulder(cell.p);', rounded: true,  explodable: false, consumable: true,  sprite: { x: 0, y: 7                 } },
        BOULDERFALLING:    { code: 0x12, update: 'this.updateBoulderFalling(cell.p);', rounded: false, explodable: false, consumable: true,  sprite: { x: 0, y: 7                 } },
        DIAMOND:           { code: 0x14, update: 'this.updateDiamond(cell.p);', rounded: true,  explodable: false, consumable: true,  sprite: { x: 0, y: 10, f: 8, FPS: 20 } },
        DIAMONDFALLING:    { code: 0x16, update: 'this.updateDiamondFalling(cell.p);', rounded: false, explodable: false, consumable: true,  sprite: { x: 0, y: 10, f: 8, FPS: 20 } },
        EXPLODETOSPACE0:   { code: 0x1B, update: 'this.updateExplodeToSpace(cell.p, 0);', rounded: false, explodable: false, consumable: false, sprite: { x: 3, y: 7                 } },
        EXPLODETOSPACE1:   { code: 0x1C, update: 'this.updateExplodeToSpace(cell.p, 1);', rounded: false, explodable: false, consumable: false, sprite: { x: 4, y: 7                 } },
        EXPLODETOSPACE2:   { code: 0x1D, update: 'this.updateExplodeToSpace(cell.p, 2);', rounded: false, explodable: false, consumable: false, sprite: { x: 5, y: 7                 } },
        EXPLODETOSPACE3:   { code: 0x1E, update: 'this.updateExplodeToSpace(cell.p, 3);', rounded: false, explodable: false, consumable: false, sprite: { x: 4, y: 7                 } },
        EXPLODETOSPACE4:   { code: 0x1F, update: 'this.updateExplodeToSpace(cell.p, 4);', rounded: false, explodable: false, consumable: false, sprite: { x: 3, y: 7                 } },
        EXPLODETODIAMOND0: { code: 0x20, update: 'this.updateExplodeToDiamond(cell.p, 0);', rounded: false, explodable: false, consumable: false, sprite: { x: 3, y: 7                 } },
        EXPLODETODIAMOND1: { code: 0x21, update: 'this.updateExplodeToDiamond(cell.p, 1);', rounded: false, explodable: false, consumable: false, sprite: { x: 4, y: 7                 } },
        EXPLODETODIAMOND2: { code: 0x22, update: 'this.updateExplodeToDiamond(cell.p, 2);', rounded: false, explodable: false, consumable: false, sprite: { x: 5, y: 7                 } },
        EXPLODETODIAMOND3: { code: 0x23, update: 'this.updateExplodeToDiamond(cell.p, 3);', rounded: false, explodable: false, consumable: false, sprite: { x: 4, y: 7                 } },
        EXPLODETODIAMOND4: { code: 0x24, update: 'this.updateExplodeToDiamond(cell.p, 4);', rounded: false, explodable: false, consumable: false, sprite: { x: 3, y: 7                 } },
        PREROCKFORD1:      { code: 0x25, update: 'this.updatePreRockford(cell.p, 1);', rounded: false, explodable: false, consumable: false, sprite: { x: 1, y: 6,  f: 2, FPS: 4  } },
        PREROCKFORD2:      { code: 0x26, update: 'this.updatePreRockford(cell.p, 2);', rounded: false, explodable: false, consumable: false, sprite: { x: 1, y: 0                 } },
        PREROCKFORD3:      { code: 0x27, update: 'this.updatePreRockford(cell.p, 3);', rounded: false, explodable: false, consumable: false, sprite: { x: 2, y: 0                 } },
        PREROCKFORD4:      { code: 0x28, update: 'this.updatePreRockford(cell.p, 4);', rounded: false, explodable: false, consumable: false, sprite: { x: 3, y: 0                 } },
        BUTTERFLY1:        { code: 0x30, update: 'this.updateButterfly(cell.p, DIR.LEFT);', rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 11, f: 8, FPS: 20 } },
        BUTTERFLY2:        { code: 0x31, update: 'this.updateButterfly(cell.p, DIR.UP);', rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 11, f: 8, FPS: 20 } },
        BUTTERFLY3:        { code: 0x32, update: 'this.updateButterfly(cell.p, DIR.RIGHT);', rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 11, f: 8, FPS: 20 } },
        BUTTERFLY4:        { code: 0x33, update: 'this.updateButterfly(cell.p, DIR.DOWN);', rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 11, f: 8, FPS: 20 } },
        ROCKFORD:          { code: 0x38, update: 'this.updateRockford(cell.p, moving.dir);', rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 0                 },   // standing still
                                                                                                 left: { x: 0, y: 4,  f: 8, FPS: 20 },   // left
                                                                                                right: { x: 0, y: 5,  f: 8, FPS: 20 },   // right
                                                                                                blink: { x: 0, y: 1,  f: 8, FPS: 20 },   // blinking
                                                                                                  tap: { x: 0, y: 2,  f: 8, FPS: 20 },   // tapping
                                                                                             blinktap: { x: 0, y: 3,  f: 8, FPS: 20 } }, // tapping and blinking
        AMOEBA:            { code: 0x3A, update: 'this.updateAmoeba(cell.p);', rounded: false, explodable: false, consumable: true,  sprite: { x: 0, y: 8,  f: 8, FPS: 20 } }
      };
    
      for(var key in OBJECT) {
        OBJECT[key].name = key;                 
        OBJECT[OBJECT[key].code] = OBJECT[key]; 
      }
    
      var FIREFLIES = [];
      FIREFLIES[DIR.LEFT]  = OBJECT.FIREFLY1;
      FIREFLIES[DIR.UP]    = OBJECT.FIREFLY2;
      FIREFLIES[DIR.RIGHT] = OBJECT.FIREFLY3;
      FIREFLIES[DIR.DOWN]  = OBJECT.FIREFLY4;
    
      var BUTTERFLIES = [];
      BUTTERFLIES[DIR.LEFT]  = OBJECT.BUTTERFLY1;
      BUTTERFLIES[DIR.UP]    = OBJECT.BUTTERFLY2;
      BUTTERFLIES[DIR.RIGHT] = OBJECT.BUTTERFLY3;
      BUTTERFLIES[DIR.DOWN]  = OBJECT.BUTTERFLY4;
    
      var PREROCKFORDS = [
        OBJECT.PREROCKFORD1,
        OBJECT.PREROCKFORD2,
        OBJECT.PREROCKFORD3,
        OBJECT.PREROCKFORD4,
        OBJECT.ROCKFORD
      ];
    
      var EXPLODETOSPACE = [
        OBJECT.EXPLODETOSPACE0,
        OBJECT.EXPLODETOSPACE1,
        OBJECT.EXPLODETOSPACE2,
        OBJECT.EXPLODETOSPACE3,
        OBJECT.EXPLODETOSPACE4,
        OBJECT.SPACE
      ];
    
      var EXPLODETODIAMOND = [
        OBJECT.EXPLODETODIAMOND0,
        OBJECT.EXPLODETODIAMOND1,
        OBJECT.EXPLODETODIAMOND2,
        OBJECT.EXPLODETODIAMOND3,
        OBJECT.EXPLODETODIAMOND4,
        OBJECT.DIAMOND
      ];

    var GameObject = function()
    {
        this.storage = window.localStorage || {};
        this.score   = 0;
    }

    GameObject.prototype = 
    {
        init: function(cave)
        {
            this.cave     = cave;           
            this.width    = this.cave.width;               
            this.height   = this.cave.height;              
            this.tiles    = [];                            
            this.frameCounter    = 0;                             
            this.FPS      = 10;                            
            this.step     = 1/this.FPS;                    
            this.birth    = 2*this.FPS;                    
            this.time    = this.cave.caveTime;             // the time in seconds
            this.idle     = { blink: false, tap: false };  
            this.flash    = false;                         
            this.won      = false;                         
            this.diamonds = {
              collected: 0,
              needed: this.cave.diamondsNeeded,
              value:  this.cave.initialDiamondValue,
              extra:  this.cave.extraDiamondValue
            };
            this.amoeba = {
              max: this.cave.amoebaMaxSize,
              slow: this.cave.amoebaSlowGrowthTime/this.step // time until the amoeba grows
            };
            this.magic = {
              active: false,
              time: this.cave.magicWallMillingTime/this.step // time until magic is activated
            };
            var x, y, o, pt;
            for(y = 0 ; y < this.height ; y++) {
              for(x = 0 ; x < this.width ; x++) {
                this.tiles[x]    = this.tiles[x] || [];
                this.tiles[x][y] = { p: new Point(x,y), frame: 0, object: OBJECT[this.cave.map[x][y]] };
              }
            }
            this.triggerEvent('level', this.cave);
        },

        nextLevel: function() { /*TODO: get next map */ this.init(cave); },

        get:          function(p,dir)   {     return this.cells[p.x + (DIRX[dir] || 0)][p.y + (DIRY[dir] || 0)].object; },
        set:          function(p,o,dir) { var cell = this.cells[p.x + (DIRX[dir] || 0)][p.y + (DIRY[dir] || 0)]; cell.object = o; cell.frame = this.frame; this.triggerEvent('cell', cell) },
        clear:        function(p,dir)   { this.set(p,OBJECT.SPACE,dir); },
        move:         function(p,dir,o) { this.clear(p); this.set(p,o,dir); },
        isObjectSpace:      function(p,dir)   { var o = this.get(p,dir); return OBJECT.SPACE     === o; },
        isObjectDirt:       function(p,dir)   { var o = this.get(p,dir); return OBJECT.DIRT      === o; },
        isObjectRockford:   function(p,dir)   { var o = this.get(p,dir); return OBJECT.ROCKFORD  === o; },
        isObjectDiamond:    function(p,dir)   { var o = this.get(p,dir); return OBJECT.DIAMOND   === o; },
        isObjectFallingDiamond: function(p,dir) { var o = this.get(p,dir); return OBJECT.DIAMONDFALLING === o; },
        isObjectBoulder:    function(p,dir)   { var o = this.get(p,dir); return OBJECT.BOULDER   === o; },
        isObjectFallingBoulder: function(p,dir) { var o = this.get(p,dir); return OBJECT.BOULDERFALLING === o; },
        isObjectOutbox:     function(p,dir)   { var o = this.get(p,dir); return OBJECT.OUTBOX    === o; },
        isObjectFirefly:    function(p,dir)   { var o = this.get(p,dir); return isFirefly(o);           },
        isObjectButterfly:  function(p,dir)   { var o = this.get(p,dir); return isButterfly(o);         },
        isObjectAmoeba:     function(p,dir)   { var o = this.get(p,dir); return OBJECT.AMOEBA    === o; },
        isObjectRounded:    function(p,dir)   { var o = this.get(p,dir); return o.rounded;              },
        isObjectExplodable: function(p,dir)   { var o = this.get(p,dir); return o.explodable;           },
        isObjectConsumable: function(p,dir)   { var o = this.get(p,dir); return o.consumable;           },

        eachCell: function(callback, thisArg) 
        {
            for(var y = 0 ; y < this.height ; y++) {
              for(var x = 0 ; x < this.width ; x++) {
                callback.call(thisArg || this, this.cells[x][y]);
              }
            }
        },

        update: function() 
        {
            this.beginFrame();
            this.eachCell(
            function(cell) 
            {
              if (cell.frame < this.frame) 
              {
                if(cell.object.update)
                  eval(cell.object.update);
              }
            });
            this.endFrame();
        },

        decreaseTimer: function(n) 
        {
            this.timer = Math.max(0, this.timer - (n || 1));
            this.triggerEvent('timer', this.timer);
            return (this.timer === 0);
        },

        autoDecreaseTimer: function() 
        {
            if ((this.frame > this.birth) && ((this.frame % this.FPS) == 0))
            this.decreaseTimer(1);
        },

        runOutTimer: function() 
        {
            var amount = Math.min(3, this.timer);
            this.increaseScore(amount);
            if (this.decreaseTimer(amount))
                this.next();
        },

        collectDiamond: function() 
        {
            this.diamonds.collected++;
            this.increaseScore(this.diamonds.collected > this.diamonds.needed ? this.diamonds.extra : this.diamonds.value);
            this.triggerEvent('diamond', this.diamonds);
        },

        increaseScore: function(n) 
        {
            this.score += n;
            this.triggerEvent('score', this.score);
        },

        flashWhenEnoughDiamondsCollected: function() 
        {
            if (!this.flash && (this.diamonds.collected >= this.diamonds.needed))
                this.flash = this.frame + Math.round(this.FPS/5); // flash for 1/5th of a second 
      
            if (this.frame <= this.flash)
                this.triggerEvent('flash');
        },

        loseLevel: function() 
        {
            //TODO: show loosing screen with highscore card
            this.init();
        },

        winLevel: function() 
        {
            this.won = true;
        },

        beginFrame: function() 
        {
            this.frame++;
            this.amoeba.size     = 0;
            this.amoeba.enclosed = true;
            this.idle = moving.dir ? {} : 
            {
                blink: (randomInt(1,4)==1)  ? !this.idle.blink : this.idle.blink,
                tap:   (randomInt(1,16)==1) ? !this.idle.tap   : this.idle.tap
            }
        },

        endFrame: function() 
        {
            if (!this.amoeba.dead) 
            {
                if (this.amoeba.enclosed)
                    this.amoeba.dead = OBJECT.DIAMOND;
                else if (this.amoeba.size > this.amoeba.max)
                    this.amoeba.dead = OBJECT.BOULDER;
                else if (this.amoeba.slow > 0)
                    this.amoeba.slow--;
            }     
      
            this.magic.active = this.magic.active && (--this.magic.time > 0);
            this.flashWhenEnoughDiamondsCollected();
      
            if (this.won)
                this.runOutTimer();
            else if (this.frame - this.foundRockford > (4 * this.FPS))
                this.loseLevel();
            else
                this.autoDecreaseTimer();
        },

        updatePreRockford: function(point, numb) 
        {
            if (this.frame >= this.birth)
                this.set(point, PREROCKFORDS[numb+1]);
        },

        updatePreOutbox: function(point) 
        {
            if (this.diamonds.collected >= this.diamonds.needed)
                this.set(point, OBJECT.OUTBOX);
        },

        updateRockford: function(point, direction) 
        {
            this.foundRockford = this.frame;
      
            if (this.won) 
            {
                //TODO: display waitscreen for next stage
            }
            else if (this.timer === 0) 
            {
                this.explode(point);
            }
            else if (moving.grab) 
            {
                if (this.isdirt(point, direction)) 
                {
                    this.clear(point, direction);
                }
                else if (this.isdiamond(point,direction) || this.isfallingdiamond(point, direction)) 
                {
                    this.clear(point, direction);
                    this.collectDiamond();
                }
                else if (horizontal(direction) && this.isboulder(point, direction)) 
                {
                    this.push(point, direction);
                }
            }
            else if (this.isempty(point, direction) || this.isdirt(point, direction)) 
            {
                this.move(point, direction, OBJECT.ROCKFORD);
            }
            else if (this.isdiamond(point, direction)) 
            {
                this.move(point, direction, OBJECT.ROCKFORD);
                this.collectDiamond();
            }
            else if (horizontal(direction) && this.isboulder(point, direction)) 
            {
                this.push(point, direction);
            }
            else if (this.isoutbox(point, direction)) 
            {
                this.move(point, direction, OBJECT.ROCKFORD);
                this.winLevel();
            }
        },

        updateBoulder: function(point) 
        {
            if (this.isempty(point, DIR.DOWN))
                this.set(point, OBJECT.BOULDERFALLING);
            else if (this.isrounded(point, DIR.DOWN) && this.isempty(point, DIR.LEFT) && this.isempty(point, DIR.DOWNLEFT))
                this.move(point, DIR.LEFT, OBJECT.BOULDERFALLING);
            else if (this.isrounded(point, DIR.DOWN) && this.isempty(point, DIR.RIGHT) && this.isempty(point, DIR.DOWNRIGHT))
                this.move(point, DIR.RIGHT, OBJECT.BOULDERFALLING);
        },

        updateBoulderFalling: function(point) 
        {
            if (this.isempty(point, DIR.DOWN))
                this.move(point, DIR.DOWN, OBJECT.BOULDERFALLING);
            else if (this.isexplodable(point, DIR.DOWN))
                this.explode(point, DIR.DOWN);
            else if (this.ismagic(point, DIR.DOWN))
                this.domagic(point, OBJECT.DIAMOND);
            else if (this.isrounded(point, DIR.DOWN) && this.isempty(point, DIR.LEFT) && this.isempty(point, DIR.DOWNLEFT))
                this.move(point, DIR.LEFT, OBJECT.BOULDERFALLING);
            else if (this.isrounded(point, DIR.DOWN) && this.isempty(point, DIR.RIGHT) && this.isempty(point, DIR.DOWNRIGHT))
                this.move(point, DIR.RIGHT, OBJECT.BOULDERFALLING);
            else
                this.set(point, OBJECT.BOULDER);
        },

        updateDiamond: function(point) 
        {
            if (this.isempty(point, DIR.DOWN))
                this.set(point, OBJECT.DIAMONDFALLING);
            else if (this.isrounded(point, DIR.DOWN) && this.isempty(point, DIR.LEFT) && this.isempty(point, DIR.DOWNLEFT))
                this.move(point, DIR.LEFT, OBJECT.DIAMONDFALLING);
            else if (this.isrounded(point, DIR.DOWN) && this.isempty(point, DIR.RIGHT) && this.isempty(point, DIR.DOWNRIGHT))
                this.move(point, DIR.RIGHT, OBJECT.DIAMONDFALLING);
        },

        updateDiamondFalling: function(point) 
        {
            if (this.isempty(point, DIR.DOWN))
                this.move(point, DIR.DOWN, OBJECT.DIAMONDFALLING);
            else if (this.isrockford(point, DIR.DOWN))
            {
                this.clear(point);
                this.collectDiamond();
            }
            else if (this.ismagic(point, DIR.DOWN))
                this.domagic(point, OBJECT.BOULDER);
            else if (this.isrounded(point, DIR.DOWN) && this.isempty(point, DIR.LEFT) && this.isempty(point, DIR.DOWNLEFT))
                this.move(point, DIR.LEFT, OBJECT.DIAMONDFALLING);
            else if (this.isrounded(point, DIR.DOWN) && this.isempty(point, DIR.RIGHT) && this.isempty(point, DIR.DOWNRIGHT))
                this.move(point, DIR.RIGHT, OBJECT.DIAMONDFALLING);
            else
                this.set(point, OBJECT.DIAMOND);
        },

        updateFirefly: function(point, direction) 
        {
            var tmpDir = rotateLeft(direction);
            
            if (this.isrockford(point, DIR.UP) || this.isrockford(point, DIR.DOWN) || this.isrockford(point, DIR.LEFT) || this.isrockford(point, DIR.RIGHT))
                this.explode(point);
            else if (this.isamoeba(point, DIR.UP) || this.isamoeba(point, DIR.DOWN) || this.isamoeba(point, DIR.LEFT) || this.isamoeba(point, DIR.RIGHT))
                this.explode(point);
            else if (this.isempty(point, tmpDir))
                this.move(point, tmpDir, FIREFLIES[tmpDir]);
            else if (this.isempty(point, direction))
                this.move(point, direction, FIREFLIES[direction]);
            else
                this.set(point, FIREFLIES[rotateRight(direction)]);
        },

        updateButterfly: function(point, direction) 
        {
            var tmpDir = rotateRight(direction);
            
            if (this.isrockford(point, DIR.UP) || this.isrockford(point, DIR.DOWN) || this.isrockford(point, DIR.LEFT) || this.isrockford(point, DIR.RIGHT))
                this.explode(point);
            else if (this.isamoeba(point, DIR.UP) || this.isamoeba(point, DIR.DOWN) || this.isamoeba(point, DIR.LEFT) || this.isamoeba(point, DIR.RIGHT))
                this.explode(point);
            else if (this.isempty(point, tmpDir))
                this.move(point, tmpDir, BUTTERFLIES[tmpDir]);
            else if (this.isempty(p, dir))
                this.move(point, direction, BUTTERFLIES[direction]);
            else
                this.set(point, BUTTERFLIES[rotateLeft(direction)]);
        },

        updateExplodeToSpace: function(point, frame) 
        {
            this.set(point, EXPLODETOSPACE[frame+1]);
        },

        updateExplodeToDiamond: function(point, frame) 
        {
            this.set(point, EXPLODETODIAMOND[frame+1]);
        },

        updateAmoeba: function(point) 
        {
            if (this.amoeba.dead) 
            {
                this.set(point, this.amoeba.dead);
            }
            else 
            {
                this.amoeba.size++;
        
                if (this.isempty(point, DIR.UP) || this.isempty(point, DIR.DOWN) || this.isempty(point, DIR.RIGHT) || this.isempty(point, DIR.LEFT) ||
                        this.isdirt(point,  DIR.UP) || this.isdirt(point,  DIR.DOWN) || this.isdirt(point,  DIR.RIGHT) || this.isdirt(point,  DIR.LEFT)) 
                {
                    this.amoeba.enclosed = false;
                }
        
                if (this.frame >= this.birth) 
                {
                    var grow = this.amoeba.slow ? (randomInt(1, 128) < 4) : (randomInt(1, 4) == 1);
                    var direction  = randomChoice([DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT]);
          
                    if (grow && (this.isdirt(point, direction) || this.isempty(point, direction)))
                        this.set(point, OBJECT.AMOEBA, direction);
                }
            }
        },

        explode: function(point, direction) 
        {
            var tmpPoint        = new Point(point.x, point.y, direction);
            var explosion = (this.isbutterfly(tmpPoint) ? OBJECT.EXPLODETODIAMOND0 : OBJECT.EXPLODETOSPACE0);
            this.set(tmpPoint, explosion);
      
            for(direction = 0 ; direction < 8 ; direction++) 
            {
                if (this.isexplodable(tmpPoint, direction))
                    this.explode(tmpPoint, direction);
                else if (this.isconsumable(tmpPoint, direction))
                    this.set(tmpPoint, explosion, direction);
            }
        },

        push: function(point, direction) 
        {
            var tmpPoint = new Point(Point.x, point.y, direction);
      
            if (this.isempty(tmpPoint, direction)) 
            {
                if (randomInt(1,8) == 1) 
                {
                    this.move(tmpPoint, direction, OBJECT.BOULDER);
          
                    if (!moving.grab)
                        this.move(point, direction, OBJECT.ROCKFORD);
                }
            }
        },

        domagic: function(point, toObject) 
        {
            if (this.magic.time > 0) 
            {
                this.magic.active = true;
                this.clear(point);
                var tmpPoint = new Point(point.x, point.y + 2);
        
                if (this.isempty(tmpPoint))
                    this.set(tmpPoint, toObject);
            }
        },

        registerEvent: function(eventName, callback, target) 
        {
            this.subscribers = this.subscribers || {};
            this.subscribers[eventName] = this.subscribers[eventName] || [];
            this.subscribers[eventName].push({ callback: callback, target: target });
        },

        triggerEvent: function(eventName) 
        {
            if (this.subscribers && this.subscribers[eventName]) 
            {
                var subs = this.subscribers[eventName];
                var args = [].slice.call(arguments, 1);
                var n, sub;
        
                for(n = 0 ; n < subs.length ; n++) 
                {
                    sub = subs[n];
                    sub.callback.apply(sub.target, args);
                }
            }
        }
    }

    function Render(gameObject) 
    {
        gameObject.registerEvent('level', this.onChangeLevel,   this);
        gameObject.registerEvent('score', this.invalidateScore, this);
        gameObject.registerEvent('timer', this.invalidateScore, this);
        gameObject.registerEvent('flash', this.invalidateCave,  this);
        gameObject.registerEvent('cell',  this.invalidateCell,  this);
    }
    
    Render.prototype = 
    {
    
        init: function(sprites) 
        {
            this.canvas     = document.getElementById('gameCanvas');
            this.ctx        = this.canvas.getContext('2d');
            this.sprites    = sprites;
            this.FPS        = 30;
            this.step       = 1/this.FPS;
            this.frame      = 0;
            this.ctxSprites = document.createElement('canvas').getContext('2d');
            this.ctxSprites.canvas.width  = this.sprites.width;
            this.ctxSprites.canvas.height = this.sprites.height;
            this.ctxSprites.drawImage(this.sprites, 0, 0, this.sprites.width, this.sprites.height, 0, 0, this.sprites.width, this.sprites.height);
            this.resize();
        },
    
        onChangeLevel: function(info) 
        {
            this.colors(info.color1, info.color2);
            this.invalidateCave();
            this.invalidateScore();
        },
    
        invalid: { score: true, cave:  true },
        invalidateScore: function()     { this.invalid.score = true;  },
        invalidateCave:  function()     { this.invalid.cave  = true;  },
        invalidateCell:  function(cell) { cell.invalid       = true;  },
        validateScore:   function()     { this.invalid.score = false; },
        validateCave:    function()     { this.invalid.cave  = false; },
        validateCell:    function(cell) { cell.invalid       = false; },
    
        update: function() 
        {
            this.frame++;
            this.score();
            game.eachCell(this.cell, this);
            this.validateCave();
        },
    
        score: function() 
        {
            if (this.invalid.score) 
            {    
                scoreLabel.innerText = 'Score: ' + game.score;
                diamondsLabel.innerText = game.diamonds.collected + ' / ' + game.diamonds.needed;
                timerLabel.innerText = game.timer;
                this.validateScore();
            }
        },
    
        cell: function(cell) 
        {
            var object = cell.object,
                sprite = object.sprite;
            
            if (this.invalid.cave || cell.invalid || (sprite.f > 1) || (object === OBJECT.ROCKFORD)) 
            {
                if (object === OBJECT.ROCKFORD)
                    return this.rockford(cell);
                else if ((object === OBJECT.SPACE) && (game.flash > game.frame))
                    sprite = OBJECT.SPACE.flash;
                else if ((object === OBJECT.MAGICWALL) && !game.magic.active)
                    sprite = OBJECT.BRICKWALL.sprite;
            
                this.sprite(sprite, cell);
                this.validateCell(cell);
            }
        },
    
        sprite: function(sprite, cell) 
        { 
            // TODO: get images another way
            var f = sprite.f ? (Math.floor((sprite.FPS/this.FPS) * this.frame) % sprite.f) : 0;
            this.ctx.drawImage(this.ctxSprites.canvas, (sprite.x + f) * 32, sprite.y * 32, 32, 32, cell.p.x * this.dx, (cell.p.y) * this.dy, this.dx, this.dy);
        },
    
        rockford: function(cell) 
        {
            if ((moving.dir == DIR.LEFT) || (vertical(moving.dir) && (moving.lastXDir == DIR.LEFT)))
                this.sprite(OBJECT.ROCKFORD.left, cell);
            else if ((moving.dir == DIR.RIGHT) || (vertical(moving.dir) && (moving.lastXDir == DIR.RIGHT)))
                this.sprite(OBJECT.ROCKFORD.right, cell);
            else if (game.idle.blink && !game.idle.tap)
                this.sprite(OBJECT.ROCKFORD.blink, cell);
            else if (!game.idle.blink && game.idle.tap)
                this.sprite(OBJECT.ROCKFORD.tap, cell);
            else if (game.idle.blink && game.idle.tap)
                this.sprite(OBJECT.ROCKFORD.blinktap, cell);
            else
                this.sprite(OBJECT.ROCKFORD.sprite, cell);
        },
    
    
        colors: function(color1, color2) 
        {
            this.ctxSprites.drawImage(this.sprites, 0, 0, this.sprites.width, this.sprites.height, 0, 0, this.sprites.width, this.sprites.height);
            var pixels = this.ctxSprites.getImageData(0, 0, this.sprites.width, this.sprites.height);
            var x, y, n, r, g, b, a;
            
            for(y = 0 ; y < this.sprites.height ; ++y) 
            {
                for(x = 0 ; x < this.sprites.width ; ++x) 
                {
                    n = (y*this.sprites.width*4) + (x*4);
                    color = (pixels.data[n + 0] << 16) + 
                            (pixels.data[n + 1] << 8) +
                            (pixels.data[n + 2] << 0);
              
                    if (color == 0x3F3F3F) 
                    { 
                        // mostly the metalic wall
                        pixels.data[n + 0] = (color2 >> 16) & 0xFF;
                        pixels.data[n + 1] = (color2 >> 8)  & 0xFF;
                        pixels.data[n + 2] = (color2 >> 0)  & 0xFF;
                    }
                    else if (color == 0xA52A00) 
                    { 
                        // mostly the dirt
                        pixels.data[n + 0] = (color1 >> 16) & 0xFF;
                        pixels.data[n + 1] = (color1 >> 8)  & 0xFF;
                        pixels.data[n + 2] = (color1 >> 0)  & 0xFF;
                    }
                }
            }
            
            this.ctxSprites.putImageData(pixels, 0, 0);
        },
    
        resize: function() 
        {
            var visibleArea = { w: 40, h: 22 };            
            this.canvas.width  = this.canvas.clientWidth;  
            this.canvas.height = this.canvas.clientHeight; 
            this.dx = this.canvas.width  / visibleArea.w;
            this.dy = this.canvas.height / visibleArea.h;  
            this.invalidateScore();
            this.invalidateCave();
        }
    
    }
}