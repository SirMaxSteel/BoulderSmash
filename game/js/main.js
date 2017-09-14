var loadingScreen;
var menuScreen;
var pauseScreen;

var gameCanv;
var contextmenu;
var maps;

var selectedMapBlock;

var map;

var canvholder;

var ctx;
var fullyLoaded = 0;

var SCREENS = { LOADING: 0, MENU: 1, GAME: 2, MAPEDITOR: 3, COMMUNITY: 4, PAUSE: 5 };
var currentScreen = SCREENS.LOADING;

var themes = {
    1: "assets/test.png",
    2: "assets/test.png",
    3: "assets/test.png"
}

var activeTheme;
var tileSize;
var mapsLoaded = 0;

var paused = false;

var highscoreSection;


document.addEventListener('DOMContentLoaded', game, false);
window.addEventListener('resize', onResize, false);

var Util = (function () {

    var _pubEvents = [];

    var _menuPositionX;
    var _menuPositionY;

    var _contextmenuState = 0;
    var _contextmenuActiveClass = 'contextmenu_active';
    
    var _menuPosition;
    
    var MAPTYPE = {
        C64: 1,
        BD: 2,
        BDR: 3
    };
    
    var MSGBUTTON = {
        AbortRetryIgnore:1,
        Ok:2,
        OkCancel:3,
        RetryCancel:4,
        YesNo:5,
        YesNoCancel:6 
    };
    

    var registerPubEvent = function(eventName, callback, target) 
    {
        _pubEvents = _pubEvents || {};
        _pubEvents[eventName] = _pubEvents[eventName] || [];
        _pubEvents[eventName].push({ callback: callback, target: target });
    };

    var triggerPubEvent = function(eventName)
    {
        if (_pubEvents && _pubEvents[eventName]) 
        {
            var listeners = _pubEvents[eventName];
            var args = [].slice.call(arguments, 1);
            var n, listener;
        
            for(n = 0 ; n < listeners.length ; ++n) 
            {
                listener = listeners[n];

                if(!listener.callback)
                    console.log('no callback');

                listener.callback.apply(listener.target, args);
            }
        }
    };
    
    
    function toggleContextMenuOn(contextMenu)
    {
        "use strict";

        if(_contextmenuState !== 1)
        {
            _contextmenuState = 1;
            contextMenu.classList.add(_contextmenuActiveClass);
        }
    };

    function toggleContextMenuOff(contextMenu)
    {
        if(_contextmenuState === 1)
        {
            _contextmenuState = 0;

            contextMenu.classList.remove(_contextmenuActiveClass);
        }
    };

    function positionContextMenu(ev)
    {
        _menuPosition = getMousePosition(ev);

        var menuWidth = contextmenu.offsetWidth + 4;
        var menuHeight = contextmenu.offsetHeight + 4;

        _menuPositionX = menuPosition.x + 'px';
        _menuPositionY = menuPosition.y + 'px';

        contextmenu.style.left = _menuPositionX;
        contextmenu.style.top = _menuPositionY;   

        if((window.innerWidth - _menuPosition.x) < menuWidth)
        {
            contextmenu.style.left = window.innerWidth - menuWidth + 'px';
        }

        if((window.innerHeight - _menuPosition.y) < menuHeight)
        {
            contextmenu.style.top = window.innerHeight - menuHeight + 'px';
        }
    };

    function clickInsideElement(ev, idName)
    {
        var el = ev.srcElement || ev.target;

        if(el.id === idName)
        {
            return el;
        }
        else
        {
            while( el = el.parentNode)
            {
                if(el.id && el.id === idName)
                {
                    return el;
                }
            }
        }

        return false;
    };

    function getMousePosition(ev)
    {
        var posX = 0;
        var posY = 0;

        if(!ev)
        {
            var ev = window.event;
        }

        if(ev.pageX || ev.pageY)
        {
            posX = ev.pageX;
            posY = ev.pageY;
        }
        else if(ev.clientX || ev.clientY)
        {
            posX = ev.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posY = ev.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        return {
            x: posX,
            y: posY
        };
    };

    function Map (name, width, height, map, mapType) {
        
            this.name = name;
        
            this.description = '';
        
            this.width = width;
        
            this.height = height;
        
            this.map = map || [];
        
            this.diamondsNeeded = 0;
            this.magicWallMillingTime = 3;
            this.amoebaSlowGrowthTime = 3;
            this.initialDiamondValue = 15;
            this.extraDiamondValue = 20;
            this.time = 150;
        
            this.mapType = mapType || MAPTYPE.BD;
        
            this.color1 = 0x6A5400;
            this.color2 = 0x8A8A8A;
           
           
        
            this.addTile = function(code, col, row)
            {
                this.map[row] = this.map[row] || [];
                this.map[row][col] = parseInt(code);
            };
        
            this.drawLine = function(code, x, y, length, dir) 
            {
                var dx = [ 0,  1, 1, 1, 0, -1, -1, -1 ][dir],
                dy = [-1, -1, 0, 1, 1,  1,  0, -1 ][dir];
        
                for(var n = 0 ; n < length ; n++) 
                {
                    this.addTile(code, x, y);
                    x += dx;
                    y += dy;
                }
            };
        
            this.drawRect = function(code, x, y, width, height) 
            {
                this.drawLine(code, x,         y,          width,   DIR.RIGHT);
                this.drawLine(code, x,         y+height-1, width,   DIR.RIGHT);
                this.drawLine(code, x,         y,          height,  DIR.DOWN);
                this.drawLine(code, x+width-1, y,          height,  DIR.DOWN);
            };
        
        
            if(this.map.length === 0)
            {
                for(y = 0; y < this.height; y++)
                {
                   this.map[y] = [];
        
                   //initial new map with dirt
                   for(var x = 0; x < this.width; x++)
                    this.map[y][x] = 6;
        
                  //Draw the border Rect
                    this.drawRect(9, 0, 0, this.width, this.height);
                }                
            }
           
        
            this.generateFromJSONString = function(jsonString)
            {
                var tempObj = JSON.parse(jsonString);
        
                this.generateFromJSONObject(tempObj);
            };
        
            this.generateFromJSONObject = function(jsonObject)
            {
                this.name =jsonObject.name;
                this.map=jsonObject.map;
                this.height=jsonObject.height;
                this.width=jsonObject.width;
            };
        
        
            this.getTiles = function()
            {
                return this.map;
            };
        
            this.getTileAt = function(col, row) 
            {
                return this.map[row][col];
            };
        
            this.tileExistsAt = function(col, row)
            {        
                return this.map[row][col] !== 0x00;
            };
        
            this.removeTileObject = function(col, row)
            {
                //var index = this.tiles.findIndex( x => x.col === col && x.row === row)
        
                //this.tiles.splice(index, 1);
        
                this.map[row][col] = 0x00;
            };
        }
        
        function selectMapBlock(ev) {
        
            if(selectedMapBlock) {
                selectedMapBlock.classList.remove('selectedBlueBorder');
            }
        
            selectedMapBlock = ev.target;
            selectedMapBlock.classList.add('selectedBlueBorder')
        
            var btnOk = document.getElementById('btnMapSelectionOk');
        
            btnOk.removeAttribute('disabled');
        }
        
        function drawMap(ctx, map, isEngine)
        {   
            if(!ctx)
            {
                console.log('context null');
                return;
            }
        
            if(!map)
            {
                ctx.fillStyle ='#ffffff';
                ctx.textBaseline='middle';
                ctx.textAlign='center';
                ctx.font='24px Arial';
                ctx.fillText('Load a map or create one.', gameCanv.width/2, gameCanv.height/2);
                return;
            }
        
            var tiles = map.getTiles();
        
            var tileSize = parseInt(ctx.canvas.clientWidth / 40);
        
        
            var tileWidth = tileSize;
            var tileHeight = tileSize;
        
        
            if(isEngine) 
            {
                tileWidth = tileSize - 2;
                tileHeight = tileSize - 2;
            }
        
            for(var y = 0; y < tiles.length; y++)
               for(var x = 0; x < tiles[y].length; x++)
               {
                    var tileCode = tiles[y][x];
        
                    var ele;
        
                    if(isEngine) {
                        ele = document.getElementById(tileCode);
                    }
                    else {
                    
                    }
        
                    if(ele)
                    {
                        ctx.drawImage(ele, x * tileSize + 1, y * tileSize + 1, tileWidth, tileHeight);
                    }
               }
        };

        return { // keep this damn bracket here!!!
            registerPubEvent: registerPubEvent,
            triggerPubEvent: triggerPubEvent,
            toggleContextMenuOn: toggleContextMenuOn,
            toggleContextMenuOff: toggleContextMenuOff,
            positionContextMenu: positionContextMenu,
            getMousePosition: getMousePosition,
            clickInsideElement: clickInsideElement,
            Map:Map,
            drawMap: drawMap,
            MAPTYPE: MAPTYPE,
            MSGBUTTON:MSGBUTTON
        };
})();

var AJAX = (function()
{
    var _objectList;
    
    var getObjects = function(isEngine)
    {
        var xmlHttp = new XMLHttpRequest();
    
        xmlHttp.onreadystatechange = function () {
            if(this.readyState == 4 && this.status == 200)
            {
                objectList = JSON.parse(this.responseText);
    
                if(isEngine)
                {
                    loadImages();
                }

                Util.triggerPubEvent('objectsLoaded');
            }
        };
    
        xmlHttp.open('GET', 'php/loadObjects.php');
        xmlHttp.send();
    };
    
    var saveMap = function()
    {
        var xmlHttp = new XMLHttpRequest();
    
        xmlHttp.onreadystatechange = function () {
            if(this.readyState == 4 && this.status == 200)
            {
                unsavedChanges = false;
                alert('Map saved successfully');

                Util.triggerPubEvent('mapSaved');
            }
        };
    
        if(map && map.map && map.map.length > 0 && unsavedChanges)
        {
            xmlHttp.open('POST', 'php/saveMap.php');
            xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xmlHttp.send(JSON.stringify(map));
        }
        else
        {
            alert('No data to save');
        }
    };
    
    function loadMaps()
    {
        var xmlHttp = new XMLHttpRequest();
    
        xmlHttp.onreadystatechange = function () {
            if(this.readyState == 4 && this.status == 200 && this.responseText && this.responseText != '')
            {
                var loadedMaps = JSON.parse(this.responseText);
    
                var tempMapArray = [];
    
                var tempNameCounter = 1;
    
                for(var i = 0; i < loadedMaps.length; i++)
                {   
                    var tObj = loadedMaps[i];

                    if(!tObj.name)
                    {
                        tObj.name = 'Anonym' + tempNameCounter;
                        tempNameCounter++;
                    }
    
                    var tMap = new Util.Map(tObj.name, tObj.width, tObj.height, tObj.map, tObj.mapType);
    
                    tMap.color1 = tObj.color1 || 0x6A5400;
                    tMap.color2 = tObj.color2 || 0x8A8A8A;
                    tMap.diamondsNeeded = tObj.diamondsNeeded || tObj.winCondition || 0;
                    tMap.time = tObj.time || 150;
                    tMap.magicWallMillingTime = tObj.magicWallMillingTime || 3;
                    tMap.amoebaSlowGrowthTime = tObj.amoebaSlowGrowthTime || 3;
                    tMapinitialDiamondValue = tObj.initialDiamondValue || 15;
                    tMap.extraDiamondValue =  tObj.extraDiamondValue || 20;
    
                    tempMapArray.push(tMap);
                }
    
                maps = tempMapArray;
    
                var modalMapSelection = document.getElementById('modalMapSelection');
    
                if(!modalMapSelection) {
                    return false; 
                }
    
                var mapListHolder = document.getElementById('mapListHolder');
    
    
                //remove all childnodes
                while (mapListHolder.firstChild) {
                    mapListHolder.removeChild(mapListHolder.firstChild);
                }
    
                for(var i = 0; i < maps.length; i++)
                {
                    var mapBlock = document.createElement('span');
    
                    mapBlock.className = 'mapBlock';
                    mapBlock.innerHTML = maps[i].name;
                    mapBlock.id = maps[i].name;
                    mapBlock.setAttribute('ondblclick', 'openMap(event)');
                    mapBlock.setAttribute('onclick', 'selectMapBlock(event)');
                    mapListHolder.appendChild(mapBlock);
                }
    
                Util.triggerPubEvent('mapsLoaded', maps);
            }
        };
    
        xmlHttp.open('GET', 'php/loadMaps.php');
        xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlHttp.send();
    };

    return {
        getObjects: getObjects,
        saveMap: saveMap,
        loadMaps: loadMaps
    };
    
})();

var Cave = (function()
{
    var Caves = function() 
    {      
        var caveList = [];
        
        var COLORS = 
        { 
            BLACK:      { n: 0x00, rgb: 0x000000 },
            WHITE:      { n: 0x01, rgb: 0xFFFFFF },
            RED:        { n: 0x02, rgb: 0x984B43 },
            CYAN:       { n: 0x03, rgb: 0x79C1C8 },
            PURPLE:     { n: 0x04, rgb: 0x9B51A5 },
            GREEN:      { n: 0x05, rgb: 0x68AE5C },
            BLUE:       { n: 0x06, rgb: 0x52429D },
            YELLOW:     { n: 0x07, rgb: 0xC9D684 },
            ORANGE:     { n: 0x08, rgb: 0x9B6739 },
            BROWN:      { n: 0x09, rgb: 0x6A5400 },
            LIGHTRED:   { n: 0x0A, rgb: 0xC37B75 },
            DARKGRAY:   { n: 0x0B, rgb: 0x636363 },
            GRAY:       { n: 0x0C, rgb: 0x8A8A8A },
            LIGHTGREEN: { n: 0x0D, rgb: 0xA3E599 },
            LIGHTBLUE:  { n: 0x0E, rgb: 0x8A7BCE },
            LIGHTGRAY:  { n: 0x0F, rgb: 0xADADAD }
        };
        
        for(var name in COLORS)
            COLORS[COLORS[name].n] = COLORS[name];
    }
        
    Caves.prototype = 
    {
        DIR: { UP: 0, UPRIGHT: 1, RIGHT: 2, DOWNRIGHT: 3, DOWN: 4, DOWNLEFT: 5, LEFT: 6, UPLEFT: 7 },
        
        SPACE:      0x00, 
        DIRT:       0x01, 
        BRICK:      0x02, 
        MAGIC     : 0x03, 
        STEEL     : 0x07, 
        FIREFLY   : 0x08, 
        BOULDER   : 0x10, 
        DIAMOND   : 0x14, 
        BUTTERFLY : 0x30, 
        ROCKFORD  : 0x38, 
        AMOEBA    : 0x3A, 
        
        decodeCave: function(cave, index) 
        {
            var object;
            var mapSizeOk = true;
            
            var result = 
            {
                index:                index, //TODO: make sure nr of cave could be use if availavble
                name:                 cave.name,
                description:          cave.description,
                width:                cave.width || cave.map[0].length,
                height:               cave.height || cave.map.length, 
                magicWallMillingTime: cave.magicWallMillingTime || 3,
                amoebaSlowGrowthTime: cave.amoebaSlowGrowthTime || 3,
                initialDiamondValue:  cave.initialDiamondValue || 15,
                extraDiamondValue:    cave.extraDiamondValue || 20,
                diamondsNeeded:       cave.diamondsNeeded,
                caveTime:             cave.time,
                color1:               cave.color1,
                color2:               cave.color2,
                amoebaMaxSize:        cave.amoebaMaxSize,
                mapType:              cave.mapType,
                map:                  [ ]
            };

            var oldHeight = result.height;
            var oldWidth = result.width;

            var top = 0, left = 0;

            var topLeft = cave.map[0][0];
            var hasBorder = (topLeft == 0x09);

            if(!hasBorder)
            {
                //shift to add border
                for(var y = result.height - 1; y >= 0; y--)
                {
                    for(var x = result.width - 1; x >= 0; x--)
                    {        
                        cave.map[y][x + 1] = cave.map[y][x];
                        cave.map[y][x] = undefined;
                    }

                    cave.map[y + 1] = cave.map[y];
                    cave.map[y] = [];
                }

                oldHeight++;
                oldWidth++;
                result.width++;
                result.height++;

                if(result.height >= 22)
                {
                    cave.map[result.height] = [];

                    // add bottom border
                    oldHeight++;
                    result.height++
                }

                if(result.width >= 40)
                {
                    //add right border
                    for(var y = 0; y < result.height; y++)
                        cave.map[y][result.width] = undefined;
                    
                        oldWidth++;
                        result.width++;
                }
            }

            if(result.height < 22)
            {
                top = Math.floor(11 - (result.height  / 2));

                if(top > 0)
                {
                    for(var y = result.height -1; y >= 0; y--)
                    {              
                        cave.map[y + top] = cave.map[y];
                        cave.map[y] = [];
                    }
                }

                result.height = 22;
                mapSizeOk = false;
            }

            if(result.width < 40)
            {
               left =  Math.floor(20 - (result.width  / 2));

               if(left > 0)
               {
                    for(var y = top; y < oldHeight + top; y++)
                    {
                        for(var x = result.width - 1; x >= 0; x--)
                        {        
                            cave.map[y][x + left] = cave.map[y][x];
                            cave.map[y][x] = undefined;
                        }
                    }
                }
                
                result.width = 40;
                mapSizeOk = false;
            }
            
            for(var y = 0 ; y < result.height ; y++)
                for (var x = 0 ; x < result.width ; x++)
                {
                    let col = cave.map[y];
                    let object;
                    let objectCode

                    if(col)
                        objectCode = col[x];
        
                    switch(objectCode)
                    {
                        case 1:  object = 0x25; break;
                        case 2:  object = 0x04; break;
                        case 3:  object = 0x00; break;
                        case 4: 
                        case 5: 
                        case 6:
                                object = 0x01; break;
                        case 7:
                        case 8: 
                                object = 0x02; break;
                        case 9:
                                object = 0x07; break;
                        case 10:
                        case 11:
                        case 12:
                        case 13:
                        case 14:
                        case 15: 
                                object = 0x10; break;
                        case 16:
                        case 17:
                        case 18:
                        case 19:
                        case 20: object = 0x14; break;
                        case 21:
                        case 22:
                        case 23:
                        case 24: object = 0x30; break;
                        case 25:
                        case 26:
                        case 27:
                        case 28: object = 0x08; break;
                        case 32: object = 0x3A; break;
                        case undefined: object = 0x07; break;
        
                        default: object = 0x00; break;
                    }
        
                    this.drawSingleObject(result, object, x, y);
                }
        
            return result;
        },
        
        drawSingleObject: function(result, object, x, y) 
        {
            result.map[x]    = result.map[x] || [];
            result.map[x][y] = object;
        },
        
        drawLine: function(result, object, x, y, length, dir) 
        {
            var dx = [ 0,  1, 1, 1, 0, -1, -1, -1 ][dir],
                dy = [-1, -1, 0, 1, 1,  1,  0, -1 ][dir];
            
            for(var n = 0 ; n < length ; n++)
            {
                this.drawSingleObject(result, object, x, y);
                x += dx;
                y += dy;
            }
        },
        
        drawFilledRect: function(result, object, x, y, width, height, fill) 
        {
            this.drawRect(result, object, x, y, width, height);
            var minx = x + 1, maxx = x + width  - 1,
                miny = y + 1, maxy = y + height - 1;
            
            for(x = minx ; x < maxx ; x++)
                for(y = miny ; y < maxy ; y++)
                    this.drawSingleObject(result, fill, x, y);
        },
        
        drawRect: function(result, object, x, y, width, height) 
        {
            this.drawLine(result, object, x,         y,          width,   this.DIR.RIGHT);
            this.drawLine(result, object, x,         y+height-1, width,   this.DIR.RIGHT);
            this.drawLine(result, object, x,         y,          height,  this.DIR.DOWN);
            this.drawLine(result, object, x+width-1, y,          height,  this.DIR.DOWN);
        },
        
        loadMaps: function(mapList)
        {
        
            for(var i = 0 ; i < mapList.length ; i++)
            {
                this.caveList = this.caveList || [];
                let map = mapList[i];
        
                if(map.mapType === Util.MAPTYPE.BD)
                    this.caveList.push(this.decodeCave(map, i));
            }
        }     
    }

    var Caves = new Caves();

    return {
        Caves: Caves
    };

})();

function game()
{
    // Initial screen overlay
    loadingScreen = document.getElementById('loadingScreen');
    menuScreen = document.getElementById('menuScreen');
    pauseScreen = document.getElementById('pauseScreen');

    highscoreSection = document.getElementById('menuScoreScores');
    //TODO: load the scores

    //window.onkeyup = keyUpHandler; // TODO: get from utils
    gameCanv = document.getElementById('gameCanvas');
    canvholder = document.getElementById('gameHolder');

    Util.registerPubEvent('mapsLoaded', bdMapsLoaded, Cave.Caves);

    //TODO: set width and high of canvas

    if(gameCanv)
    {
        ctx = gameCanv.getContext("2d");

        document.addEventListener('contextmenu', function(event) 
        {
            if(Util.clickInsideElement(event, 'gameCanvas'))
            {
                event.preventDefault();
                Util.toggleContextMenuOn(contextmenu);
                Util.positionContextMenu(event);
            }
            else
            {
                Util.toggleContextMenuOff(contextmenu);
            }
        }, false);

        tileSize = ctx.canvas.clientWidth / 40;
    }

    AJAX.loadMaps();

    drawScreen();
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
}

// Load all pictures from themes into themes
function loadAssets(){
    var finished = 0;
    var max = 0;
    max += Object.keys(themes).length;
    for ( i = 1; i <= max; i++ ){
        finished++;
        var img = new Image();
        img.addEventListener('load', function(){
            finished--;
        });
        img.src = themes[i];
        themes[i] = img;
    }
    
    // Wait until all themes are completly loaded
    var checkFinished  = function(){
        if (finished == 0 && mapsLoaded === 1){
            currentScreen = SCREENS.MENU; // TODO: change back to 1 for menu
            drawScreen();
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
    
    
        Util.drawMap(ctx, cMap, false);
    
        Util.closeModal(ev);
    
        return true;
    };

function drawScreen(){
    switch(currentScreen){
        case SCREENS.LOADING:
            drawLoading();
            break;
        case SCREENS.MENU:
            drawMenu();
            break;
        case SCREENS.GAME:
            drawGame();
            break;
        case SCREENS.MAPEDITOR:
            drawMapEditor();
            break;
        case SCREENS.COMMUNITY:
            drawCommunity();
            break;
    }
}

function onResize(){
    gameCanv.width = gameCanv.clientWidth;
    gameCanv.height = gameCanv.clientHeight;
    
    if(gameCanv.width/40 <= gameCanv.height/23){
        tileSize = Math.floor(gameCanv.width/40);
    }
    else{
        tileSize = Math.floor(gameCanv.height/23);
    }
}

function drawLoading()
{
    loadingScreen.style.display = 'block';
}

function drawMenu(){
    gameCanv.style.style = 'none';
    menuScreen.style.display = 'block';
}

function drawGame(){
    loadingScreen.style.display = 'none';
    menuScreen.style.display = 'none';
    gameCanv.style.display = 'block';

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if(canvas.width/40 <= canvas.height/24){
        tileSize = Math.floor(canvas.width/40);
    }
    else{
        tileSize = Math.floor(canvas.height/24);
    }

    Cave.Caves.loadMaps(maps);
    BoulderDash();
}

function drawMapEditor(){
    console.log('test');
}

function drawCommunity(){
    console.log('test');
}

function resume()
{
    pauseScreen.style.display = 'none';
    menuScreen.style.display = 'none';
    paused = false;
}

function gotoMenu()
{

}

function play()
{
    currentScreen = SCREENS.GAME;
    drawScreen();
}


BoulderDash = function()
{
    var KEY = { ENTER: 13, ESC: 27, SPACE: 32, PAGEUP: 33, PAGEDOWN: 34, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, F: 70, W: 87, A: 65, S: 83, D: 68, E: 69, M: 77, P: 80, R: 82, N: 78, B:66 };

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
        PREOUTBOX:         { code: 0x04, update: function(obj, cell) { obj.updatePreOutbox(cell.p); }, rounded: false, explodable: false, consumable: false, sprite: { x: 1, y: 6                 } },
        OUTBOX:            { code: 0x05, rounded: false, explodable: false, consumable: false, sprite: { x: 1, y: 6,  f: 2, FPS: 4  } },
        STEELWALL:         { code: 0x07, rounded: false, explodable: false, consumable: false, sprite: { x: 1, y: 6                 } },
        FIREFLY1:          { code: 0x08, update: function(obj, cell) { obj.updateFirefly(cell.p, DIR.LEFT); }, rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 9,  f: 8, FPS: 20 } },
        FIREFLY2:          { code: 0x09, update: function(obj, cell) { obj.updateFirefly(cell.p, DIR.UP); }, rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 9,  f: 8, FPS: 20 } },
        FIREFLY3:          { code: 0x0A, update: function(obj, cell) { obj.updateFirefly(cell.p, DIR.RIGHT); }, rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 9,  f: 8, FPS: 20 } },
        FIREFLY4:          { code: 0x0B, update: function(obj, cell) { obj.updateFirefly(cell.p, DIR.DOWN); }, rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 9,  f: 8, FPS: 20 } },
        BOULDER:           { code: 0x10, update: function(obj, cell) { obj.updateBoulder(cell.p); }, rounded: true,  explodable: false, consumable: true,  sprite: { x: 0, y: 7                 } },
        BOULDERFALLING:    { code: 0x12, update: function(obj, cell) { obj.updateBoulderFalling(cell.p); }, rounded: false, explodable: false, consumable: true,  sprite: { x: 0, y: 7                 } },
        DIAMOND:           { code: 0x14, update: function(obj, cell) { obj.updateDiamond(cell.p); }, rounded: true,  explodable: false, consumable: true,  sprite: { x: 0, y: 10, f: 8, FPS: 20 } },
        DIAMONDFALLING:    { code: 0x16, update: function(obj, cell) { obj.updateDiamondFalling(cell.p); }, rounded: false, explodable: false, consumable: true,  sprite: { x: 0, y: 10, f: 8, FPS: 20 } },
        EXPLODETOSPACE0:   { code: 0x1B, update: function(obj, cell) { obj.updateExplodeToSpace(cell.p, 0); }, rounded: false, explodable: false, consumable: false, sprite: { x: 3, y: 7                 } },
        EXPLODETOSPACE1:   { code: 0x1C, update: function(obj, cell) { obj.updateExplodeToSpace(cell.p, 1); }, rounded: false, explodable: false, consumable: false, sprite: { x: 4, y: 7                 } },
        EXPLODETOSPACE2:   { code: 0x1D, update: function(obj, cell) { obj.updateExplodeToSpace(cell.p, 2); }, rounded: false, explodable: false, consumable: false, sprite: { x: 5, y: 7                 } },
        EXPLODETOSPACE3:   { code: 0x1E, update: function(obj, cell) { obj.updateExplodeToSpace(cell.p, 3); }, rounded: false, explodable: false, consumable: false, sprite: { x: 4, y: 7                 } },
        EXPLODETOSPACE4:   { code: 0x1F, update: function(obj, cell) { obj.updateExplodeToSpace(cell.p, 4); }, rounded: false, explodable: false, consumable: false, sprite: { x: 3, y: 7                 } },
        EXPLODETODIAMOND0: { code: 0x20, update: function(obj, cell) { obj.updateExplodeToDiamond(cell.p, 0); }, rounded: false, explodable: false, consumable: false, sprite: { x: 3, y: 7                 } },
        EXPLODETODIAMOND1: { code: 0x21, update: function(obj, cell) { obj.updateExplodeToDiamond(cell.p, 1); }, rounded: false, explodable: false, consumable: false, sprite: { x: 4, y: 7                 } },
        EXPLODETODIAMOND2: { code: 0x22, update: function(obj, cell) { obj.updateExplodeToDiamond(cell.p, 2); }, rounded: false, explodable: false, consumable: false, sprite: { x: 5, y: 7                 } },
        EXPLODETODIAMOND3: { code: 0x23, update: function(obj, cell) { obj.updateExplodeToDiamond(cell.p, 3); }, rounded: false, explodable: false, consumable: false, sprite: { x: 4, y: 7                 } },
        EXPLODETODIAMOND4: { code: 0x24, update: function(obj, cell) { obj.updateExplodeToDiamond(cell.p, 4); }, rounded: false, explodable: false, consumable: false, sprite: { x: 3, y: 7                 } },
        PREROCKFORD1:      { code: 0x25, update: function(obj, cell) { obj.updatePreRockford(cell.p, 1); }, rounded: false, explodable: false, consumable: false, sprite: { x: 1, y: 6,  f: 2, FPS: 4  } },
        PREROCKFORD2:      { code: 0x26, update: function(obj, cell) { obj.updatePreRockford(cell.p, 2); }, rounded: false, explodable: false, consumable: false, sprite: { x: 1, y: 0                 } },
        PREROCKFORD3:      { code: 0x27, update: function(obj, cell) { obj.updatePreRockford(cell.p, 3); }, rounded: false, explodable: false, consumable: false, sprite: { x: 2, y: 0                 } },
        PREROCKFORD4:      { code: 0x28, update: function(obj, cell) { obj.updatePreRockford(cell.p, 4); }, rounded: false, explodable: false, consumable: false, sprite: { x: 3, y: 0                 } },
        BUTTERFLY1:        { code: 0x30, update: function(obj, cell) { obj.updateButterfly(cell.p, DIR.LEFT); }, rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 11, f: 8, FPS: 20 } },
        BUTTERFLY2:        { code: 0x31, update: function(obj, cell) { obj.updateButterfly(cell.p, DIR.UP); }, rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 11, f: 8, FPS: 20 } },
        BUTTERFLY3:        { code: 0x32, update: function(obj, cell) { obj.updateButterfly(cell.p, DIR.RIGHT); }, rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 11, f: 8, FPS: 20 } },
        BUTTERFLY4:        { code: 0x33, update: function(obj, cell) { obj.updateButterfly(cell.p, DIR.DOWN); }, rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 11, f: 8, FPS: 20 } },
        ROCKFORD:          { code: 0x38, update: function(obj, cell) { obj.updateRockford(cell.p, moving.dir); }, rounded: false, explodable: true,  consumable: true,  sprite: { x: 0, y: 0                 },   // standing
                                                                                                 left: { x: 0, y: 4,  f: 8, FPS: 20 },   // left
                                                                                                right: { x: 0, y: 5,  f: 8, FPS: 20 },   // right
                                                                                                blink: { x: 0, y: 1,  f: 8, FPS: 20 },   // blinking
                                                                                                  tap: { x: 0, y: 2,  f: 8, FPS: 20 },   // tapping
                                                                                             blinktap: { x: 0, y: 3,  f: 8, FPS: 20 } }, // tapping and blinking
        AMOEBA:            { code: 0x3A, update: function(obj, cell) { obj.updateAmoeba(cell.p); }, rounded: false, explodable: false, consumable: true,  sprite: { x: 0, y: 8,  f: 8, FPS: 20 } }
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

      function isFirefly(o)   { return (OBJECT.FIREFLY1.code     <= o.code) && (o.code <= OBJECT.FIREFLY4.code);   }
      function isButterfly(o) { return (OBJECT.BUTTERFLY1.code   <= o.code) && (o.code <= OBJECT.BUTTERFLY4.code); }

    var Point = function(x, y, dir) 
    {
        this.x = x + (DIRX[dir] || 0);
        this.y = y + (DIRY[dir] || 0);
    };

    var GameObject = function()
    {
        this.storage = window.localStorage || {};
        this.score   = 0;
    }

    GameObject.prototype = 
    {
        init: function(cave)
        {
            this.index    = cave.index || 0;
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
              slow: this.cave.amoebaSlowGrowthTime/this.step, // time until the amoeba grows
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

        nextLevel: function() { if((Cave.Caves.caveList.length - 1) >= this.index + 1)this.init(Cave.Caves.caveList[this.index + 1]); },

        get:          function(p,dir)   {     return this.tiles[p.x + (DIRX[dir] || 0)][p.y + (DIRY[dir] || 0)].object; },
        set:          function(p,o,dir) { var cell = this.tiles[p.x + (DIRX[dir] || 0)][p.y + (DIRY[dir] || 0)]; cell.object = o; cell.frame = this.frameCounter; this.triggerEvent('cell', cell) },
        clear:        function(p,dir)   { this.set(p,OBJECT.SPACE,dir); },
        move:         function(p,dir,o) { this.clear(p); this.set(p,o,dir); },
        isObjectSpace:      function(p,dir)   { var o = this.get(p,dir); return OBJECT.SPACE     === o; },
        isObjectDirt:       function(p,dir)   { var o = this.get(p,dir); return OBJECT.DIRT      === o; },
        isObjectRockford:   function(p,dir)   { var o = this.get(p,dir); return OBJECT.ROCKFORD  === o; },
        isObjectDiamond:    function(p,dir)   { var o = this.get(p,dir); return OBJECT.DIAMOND   === o; },
        isObjectFallingDiamond: function(p,dir) { var o = this.get(p,dir); return OBJECT.DIAMONDFALLING === o; },
        isObjectBoulder:    function(p,dir)   { var o = this.get(p,dir); return OBJECT.BOULDER   === o; },
        isObjectFallingBoulder: function(p,dir) { var o = this.get(p,dir); return OBJECT.BOULDERFALLING === o; },
        isObjectMagic:      function(p,dir)   { var o = this.get(p,dir); return OBJECT.MAGICWALL === o; },
        isObjectOutbox:     function(p,dir)   { var o = this.get(p,dir); return OBJECT.OUTBOX    === o; },
        isObjectFirefly:    function(p,dir)   { var o = this.get(p,dir); return isFirefly(o);           },
        isObjectButterfly:  function(p,dir)   { var o = this.get(p,dir); return isButterfly(o);         },
        isObjectAmoeba:     function(p,dir)   { var o = this.get(p,dir); return OBJECT.AMOEBA    === o; },
        isObjectRounded:    function(p,dir)   { var o = this.get(p,dir); return o.rounded;              },
        isObjectExplodable: function(p,dir)   { var o = this.get(p,dir); return o.explodable;           },
        isObjectConsumable: function(p,dir)   { var o = this.get(p,dir); return o.consumable;           },

        foreachTile: function(callback, thisArg) 
        {
            for(var y = 0 ; y < this.height ; y++) {
              for(var x = 0 ; x < this.width ; x++) {
                callback.call(thisArg || this, this.tiles[x][y]);
              }
            }
        },

        update: function() 
        {
            this.beginFrame();
            this.foreachTile(
            function(cell) 
            {
              if (cell.frame < this.frameCounter) 
              {
                if(cell.object.update)
                  cell.object.update(this, cell);
              }
            });
            this.endFrame();
        },

        decreaseTime: function(n) 
        {
            this.time = Math.max(0, this.time - (n || 1));
            this.triggerEvent('time', this.time);
            return (this.time === 0);
        },

        autoDecreaseTime: function() 
        {
            if ((this.frameCounter > this.birth) && ((this.frameCounter % this.FPS) == 0))
            this.decreaseTime(1);
        },

        runOutTime: function() 
        {
            var amount = Math.min(3, this.time);
            this.increaseScore(amount);
            if (this.decreaseTime(amount))
                this.nextLevel();
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
                this.flash = this.frameCounter + Math.round(this.FPS/5); // flash for 1/5th of a second 
      
            if (this.frameCounter <= this.flash)
                this.triggerEvent('flash');
        },

        loseLevel: function() 
        {
            //TODO: show loosing screen with highscore card
            this.init(Cave.Caves.caveList[this.index]);
        },

        winLevel: function() 
        {
            this.won = true;
        },

        beginFrame: function() 
        {
            this.frameCounter++;
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
                this.runOutTime();
            else if (this.frameCounter - this.foundRockford > (4 * this.FPS))
                this.loseLevel();
            else
                this.autoDecreaseTime();
        },

        updatePreRockford: function(point, numb) 
        {
            if (this.frameCounter >= this.birth)
                this.set(point, PREROCKFORDS[numb+1]);
        },

        updatePreOutbox: function(point) 
        {
            if (this.diamonds.collected >= this.diamonds.needed)
                this.set(point, OBJECT.OUTBOX);
        },

        updateRockford: function(point, direction) 
        {
            this.foundRockford = this.frameCounter;
      
            if (this.won) 
            {
                //TODO: display waitscreen for next stage
            }
            else if (this.time === 0) 
            {
                this.explode(point);
            }
            else if (moving.grab) 
            {
                if (this.isObjectDirt(point, direction)) 
                {
                    this.clear(point, direction);
                }
                else if (this.isObjectDiamond(point,direction) || this.isObjectFallingDiamond(point, direction)) 
                {
                    this.clear(point, direction);
                    this.collectDiamond();
                }
                else if (horizontal(direction) && this.isObjectBoulder(point, direction)) 
                {
                    this.push(point, direction);
                }
            }
            else if (this.isObjectSpace(point, direction) || this.isObjectDirt(point, direction)) 
            {
                this.move(point, direction, OBJECT.ROCKFORD);
            }
            else if (this.isObjectDiamond(point, direction)) 
            {
                this.move(point, direction, OBJECT.ROCKFORD);
                this.collectDiamond();
            }
            else if (horizontal(direction) && this.isObjectBoulder(point, direction)) 
            {
                this.push(point, direction);
            }
            else if (this.isObjectOutbox(point, direction)) 
            {
                this.move(point, direction, OBJECT.ROCKFORD);
                this.winLevel();
            }
        },

        updateBoulder: function(point) 
        {
            if (this.isObjectSpace(point, DIR.DOWN))
                this.set(point, OBJECT.BOULDERFALLING);
            else if (this.isObjectRounded(point, DIR.DOWN) && this.isObjectSpace(point, DIR.LEFT) && this.isObjectSpace(point, DIR.DOWNLEFT))
                this.move(point, DIR.LEFT, OBJECT.BOULDERFALLING);
            else if (this.isObjectRounded(point, DIR.DOWN) && this.isObjectSpace(point, DIR.RIGHT) && this.isObjectSpace(point, DIR.DOWNRIGHT))
                this.move(point, DIR.RIGHT, OBJECT.BOULDERFALLING);
        },

        updateBoulderFalling: function(point) 
        {
            if (this.isObjectSpace(point, DIR.DOWN))
                this.move(point, DIR.DOWN, OBJECT.BOULDERFALLING);
            else if (this.isObjectExplodable(point, DIR.DOWN))
                this.explode(point, DIR.DOWN);
            else if (this.isObjectMagic(point, DIR.DOWN))
                this.domagic(point, OBJECT.DIAMOND);
            else if (this.isObjectRounded(point, DIR.DOWN) && this.isObjectSpace(point, DIR.LEFT) && this.isObjectSpace(point, DIR.DOWNLEFT))
                this.move(point, DIR.LEFT, OBJECT.BOULDERFALLING);
            else if (this.isObjectRounded(point, DIR.DOWN) && this.isObjectSpace(point, DIR.RIGHT) && this.isObjectSpace(point, DIR.DOWNRIGHT))
                this.move(point, DIR.RIGHT, OBJECT.BOULDERFALLING);
            else
                this.set(point, OBJECT.BOULDER);
        },

        updateDiamond: function(point) 
        {
            if (this.isObjectSpace(point, DIR.DOWN))
                this.set(point, OBJECT.DIAMONDFALLING);
            else if (this.isObjectRounded(point, DIR.DOWN) && this.isObjectSpace(point, DIR.LEFT) && this.isObjectSpace(point, DIR.DOWNLEFT))
                this.move(point, DIR.LEFT, OBJECT.DIAMONDFALLING);
            else if (this.isObjectRounded(point, DIR.DOWN) && this.isObjectSpace(point, DIR.RIGHT) && this.isObjectSpace(point, DIR.DOWNRIGHT))
                this.move(point, DIR.RIGHT, OBJECT.DIAMONDFALLING);
        },

        updateDiamondFalling: function(point) 
        {
            if (this.isObjectSpace(point, DIR.DOWN))
                this.move(point, DIR.DOWN, OBJECT.DIAMONDFALLING);
            else if (this.isObjectRockford(point, DIR.DOWN))
            {
                this.clear(point);
                this.collectDiamond();
            }
            else if (this.isObjectMagic(point, DIR.DOWN))
                this.domagic(point, OBJECT.BOULDER);
            else if (this.isObjectRounded(point, DIR.DOWN) && this.isObjectSpace(point, DIR.LEFT) && this.isObjectSpace(point, DIR.DOWNLEFT))
                this.move(point, DIR.LEFT, OBJECT.DIAMONDFALLING);
            else if (this.isObjectRounded(point, DIR.DOWN) && this.isObjectSpace(point, DIR.RIGHT) && this.isObjectSpace(point, DIR.DOWNRIGHT))
                this.move(point, DIR.RIGHT, OBJECT.DIAMONDFALLING);
            else
                this.set(point, OBJECT.DIAMOND);
        },

        updateFirefly: function(point, direction) 
        {
            var tmpDir = rotateLeft(direction);
            
            if (this.isObjectRockford(point, DIR.UP) || this.isObjectRockford(point, DIR.DOWN) || this.isObjectRockford(point, DIR.LEFT) || this.isObjectRockford(point, DIR.RIGHT))
                this.explode(point);
            else if (this.isObjectAmoeba(point, DIR.UP) || this.isObjectAmoeba(point, DIR.DOWN) || this.isObjectAmoeba(point, DIR.LEFT) || this.isObjectAmoeba(point, DIR.RIGHT))
                this.explode(point);
            else if (this.isObjectSpace(point, tmpDir))
                this.move(point, tmpDir, FIREFLIES[tmpDir]);
            else if (this.isObjectSpace(point, direction))
                this.move(point, direction, FIREFLIES[direction]);
            else
                this.set(point, FIREFLIES[rotateRight(direction)]);
        },

        updateButterfly: function(point, direction) 
        {
            var tmpDir = rotateRight(direction);
            
            if (this.isObjectRockford(point, DIR.UP) || this.isObjectRockford(point, DIR.DOWN) || this.isObjectRockford(point, DIR.LEFT) || this.isObjectRockford(point, DIR.RIGHT))
                this.explode(point);
            else if (this.isObjectAmoeba(point, DIR.UP) || this.isObjectAmoeba(point, DIR.DOWN) || this.isObjectAmoeba(point, DIR.LEFT) || this.isObjectAmoeba(point, DIR.RIGHT))
                this.explode(point);
            else if (this.isObjectSpace(point, tmpDir))
                this.move(point, tmpDir, BUTTERFLIES[tmpDir]);
            else if (this.isObjectSpace(point, direction))
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
        
                if (this.isObjectSpace(point, DIR.UP) || this.isObjectSpace(point, DIR.DOWN) || this.isObjectSpace(point, DIR.RIGHT) || this.isObjectSpace(point, DIR.LEFT) ||
                        this.isObjectDirt(point,  DIR.UP) || this.isObjectDirt(point,  DIR.DOWN) || this.isObjectDirt(point,  DIR.RIGHT) || this.isObjectDirt(point,  DIR.LEFT)) 
                {
                    this.amoeba.enclosed = false;
                }
        
                if (this.frameCounter >= this.birth) 
                {
                    var grow = this.amoeba.slow ? (randomInt(1, 128) < 4) : (randomInt(1, 4) == 1);
                    var direction  = randomChoice([DIR.UP, DIR.DOWN, DIR.LEFT, DIR.RIGHT]);
          
                    if (grow && (this.isObjectDirt(point, direction) || this.isObjectSpace(point, direction)))
                        this.set(point, OBJECT.AMOEBA, direction);
                }
            }
        },

        explode: function(point, direction) 
        {
            var tmpPoint        = new Point(point.x, point.y, direction);
            var explosion = (this.isObjectButterfly(tmpPoint) ? OBJECT.EXPLODETODIAMOND0 : OBJECT.EXPLODETOSPACE0);
            this.set(tmpPoint, explosion);
      
            for(direction = 0 ; direction < 8 ; direction++) 
            {
                if (this.isObjectExplodable(tmpPoint, direction))
                    this.explode(tmpPoint, direction);
                else if (this.isObjectConsumable(tmpPoint, direction))
                    this.set(tmpPoint, explosion, direction);
            }
        },

        push: function(point, direction) 
        {
            var tmpPoint = new Point(point.x, point.y, direction);
      
            if (this.isObjectSpace(tmpPoint, direction)) 
            {
                if (randomInt(1,5) == 1) 
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
        
                if (this.isObjectSpace(tmpPoint))
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
        gameObject.registerEvent('time', this.invalidateScore, this);
        gameObject.registerEvent('flash', this.invalidateCave,  this);
        gameObject.registerEvent('cell',  this.invalidateCell,  this);
    }
    
    Render.prototype = 
    {
    
        init: function(sprites) 
        {
            this.canvas     = document.getElementById('gameCanvas');
            this.ctx        = this.canvas.getContext('2d'); //TODO take global canvas
            this.sprites    = sprites;
            this.FPS        = 30;
            this.step       = 1/this.FPS;
            this.frameCounter      = 0;
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
            this.frameCounter++;
            this.score();
            game.foreachTile(this.cell, this);
            this.validateCave();
        },
    
        /*score: function() 
        {
            if (this.invalid.score) 
            {    
                scoreLabel.innerText = 'Score: ' + game.score;
                diamondsLabel.innerText = game.diamonds.collected + ' / ' + game.diamonds.needed;
                timeLabel.innerText = game.time;
                this.validateScore();
            }
        },*/

        score: function() {
            if (this.invalid.score) {
              this.ctx.fillStyle='black';
              this.ctx.fillRect(0, 0, this.canvas.width, tileSize);
              this.number(3, game.diamonds.collected, 2);
              this.letter(  5, '$');  
              this.number(7, game.diamonds.needed, 2);
              this.number(25, game.time);
              this.number(31, game.score);
              this.validateScore();
            }
          },
      
          number: function(x, num, width) {
            let numString = num.toString();
            var i, word = ('0000000000' + numString).slice(-(width || numString.length));
            for(i = 0 ; i < word.length ; ++i)
              this.letter(x+i, word[i]);
          },
      
          letter: function(x, c) {
            this.ctx.drawImage(this.ctxSprites.canvas, 9 * 32, (c.charCodeAt(0)-32) * 16, 32, 16, (x * tileSize), 0, tileSize, tileSize-4);
          },
    
        cell: function(cell) 
        {
            var object = cell.object,
                sprite = object.sprite;
            
            if (this.invalid.cave || cell.invalid || (sprite.f > 1) || (object === OBJECT.ROCKFORD)) 
            {
                if (object === OBJECT.ROCKFORD)
                    return this.rockford(cell);
                else if ((object === OBJECT.SPACE) && (game.flash > game.frameCounter))
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
            var f = sprite.f ? (Math.floor((sprite.FPS/this.FPS) * this.frameCounter) % sprite.f) : 0;
            this.ctx.drawImage(this.ctxSprites.canvas, (sprite.x + f) * 32, sprite.y * 32, 32, 32, cell.p.x * tileSize, (cell.p.y + 1) * tileSize, tileSize, tileSize);
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
                    color = (pixels.data[n] << 16) + 
                            (pixels.data[n + 1] << 8) +
                            (pixels.data[n + 2]);
              
                    if (color == 0x3F3F3F) 
                    { 
                        // mostly the metalic wall
                        pixels.data[n] = (color2 >> 16) & 0xFF;
                        pixels.data[n + 1] = (color2 >> 8)  & 0xFF;
                        pixels.data[n + 2] = (color2)  & 0xFF;
                    }
                    else if (color == 0xA52A00) 
                    { 
                        // mostly the dirt
                        pixels.data[n] = (color1 >> 16) & 0xFF;
                        pixels.data[n + 1] = (color1 >> 8)  & 0xFF;
                        pixels.data[n + 2] = (color1)  & 0xFF;
                    }
                }
            }
            
            this.ctxSprites.putImageData(pixels, 0, 0);
        },
    
        resize: function() 
        {
            var visibleArea = { w: 40, h: 23 };            
            this.canvas.width  = this.canvas.clientWidth;  
            this.canvas.height = this.canvas.clientHeight; 
            tileSize = this.canvas.width  / visibleArea.w;
            this.invalidateScore();
            this.invalidateCave();
        }
    
    }

    var game   = new GameObject(),       
    render = new Render(game);  

    function run() 
    {   
        var now, last = performance.now(), dt = 0, gdt = 0, rdt = 0;
        
        function frame() 
        {
            now = performance.now();
            dt  = Math.min(1, (now - last) / 1000);
            gdt = gdt + dt;

            while (gdt > game.step) 
            {
                gdt = gdt - game.step;

                if(!paused)
                    game.update();
            }
        
            rdt = rdt + dt;
        
            if (rdt > render.step) 
            {
                rdt = rdt - render.step;

                if(!paused)
                    render.update();
            }

            last = now;
            
            requestAnimationFrame(frame, render.canvas);
        }
        
        load(function(sprites) 
        {
            render.init(sprites); 
            game.init(Cave.Caves.caveList[0]);         
            addEvents();          
            frame();               
        });
        
    };
        
    function load(cb) 
    { //TODO: rewrite for loading multiple files
        var sprites = document.createElement('img');
        sprites.addEventListener('load', function() { cb(sprites); } , false);
        sprites.src = '../Images/sprites.png';
    };
        
        
    function addEvents() 
    {
        document.addEventListener('keydown', keydown, false);
        document.addEventListener('keyup',   keyup,   false);
        window.addEventListener('resize', function() { render.resize() }, false);
    };
        
    function keydown(ev) 
    {
        var handled = false;
        
        switch(ev.keyCode) 
        {
            case KEY.W:
            case KEY.UP:         moving.startUp();    handled = true; break;
            case KEY.S:
            case KEY.DOWN:       moving.startDown();  handled = true; break;
            case KEY.A:
            case KEY.LEFT:       moving.startLeft();  handled = true; break;
            case KEY.D:
            case KEY.RIGHT:      moving.startRight(); handled = true; break;
            case KEY.R:        game.init(Cave.Caves.caveList[game.index || 0]);        handled = true; break;
            case KEY.PAGEUP:     game.prevLevel();         handled = true; break;
            case KEY.PAGEDOWN:   game.nextLevel();         handled = true; break;
            case KEY.SPACE:      moving.startGrab();  handled = true; break;
            case KEY.ESC:        if(paused)return; paused = true; currentScreen = SCREENS.MENU; drawScreen(); break;
        }

        if (handled)
            ev.preventDefault();
    }
        
    function keyup(ev) 
    {
        switch(ev.keyCode) 
        {
            case KEY.W:
            case KEY.UP:    moving.stopUp();    handled = true; break;
            case KEY.S:
            case KEY.DOWN:  moving.stopDown();  handled = true; break;
            case KEY.A:
            case KEY.LEFT:  moving.stopLeft();  handled = true; break;
            case KEY.D:
            case KEY.RIGHT: moving.stopRight(); handled = true; break;
            case KEY.SPACE: moving.stopGrab(); handled = true; break;
            case KEY.P:     if(!paused) pauseScreen.style.display = 'block'; else pauseScreen.style.display = 'none';  paused = !paused; break;
            case KEY.N:     game.nextLevel(); break;
            case KEY.B:     game.previousLevel(); break; //TOOD: implement
        }
    }
        
    var moving = 
    {
        dir:      DIR.NONE,
        lastXDir: DIR.NONE,
        up: false, down: false, left: false, right: false, grab: false,
        startUp:    function() { this.up    = true; this.dir = DIR.UP;   },
        startDown:  function() { this.down  = true; this.dir = DIR.DOWN; },
        startLeft:  function() { this.left  = true; this.dir = DIR.LEFT;  this.lastXDir = DIR.LEFT;  },
        startRight: function() { this.right = true; this.dir = DIR.RIGHT; this.lastXDir = DIR.RIGHT; },
        startGrab:  function() { this.grab  = true; },
        stopUp:     function() { this.up    = false; this.dir = (this.dir == DIR.UP)    ? this.where() : this.dir; },
        stopDown:   function() { this.down  = false; this.dir = (this.dir == DIR.DOWN)  ? this.where() : this.dir; },
        stopLeft:   function() { this.left  = false; this.dir = (this.dir == DIR.LEFT)  ? this.where() : this.dir; },
        stopRight:  function() { this.right = false, this.dir = (this.dir == DIR.RIGHT) ? this.where() : this.dir; },
        stopGrab:   function() { this.grab  = false; },
        
        where: function() 
        {
            if (this.up)
                return DIR.UP;
            else if (this.down)
                return DIR.DOWN;
            else if (this.left)
                return DIR.LEFT;
            else if (this.right)
                return DIR.RIGHT;
        }
    }
        
    run.game   = game;   
    run.render = render;
        
    return run;
}();