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


function game(){
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
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

function drawLoading(){
    console.log('test');
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