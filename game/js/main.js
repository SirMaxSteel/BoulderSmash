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


function game(){
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    draw();
    loadAssets();
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
        if (finished == 0){
            fullyLoaded = 1;
            currentScreen = 1;
        }
        else setTimeout(checkFinished, 500);
    }
    checkFinished();
}

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
    console.log('test');
}

function drawMapEditor(){
    console.log('test');
}

function drawCommunity(){
    console.log('test');
}