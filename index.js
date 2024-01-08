
var step = 4; // pixel
var timeInterval = 5 // ms
var game = {};
var tractorCount = 0;
var keyFlag = false;
var planeColided = false;
var stopShot = false;
var canShot = true;
var canSpawnPlane = true;
var canSpawnTractor = true;
var planeHitted = false;
var spawnEnemyPosition = 1000;

var game = {};
function pressing (key){
    var KEYS = {
        'w' : moveUp,
        's' : moveDown,
        'd' : shoot
    }
    return KEYS[key]();
}

function startGame(){
    $("#init").hide();
    
    summonPlayer();
    summonTractor();
    summonPlane();

    game.pressed =[];

    $("body").keydown(function(event){
        game.pressed[event.wich] = true;
    })
    $("body").keyup(function(event){
        game.pressed[event.wich] = false;
    })
    
    game.timer = setInterval(gameLoop, 30);

}

function gameLoop(){
    moveBackground();
    moveTractor();
    movePlayer();
    movePlane();
}

function summonPlayer(){
    $("#container").append('<div id="player" class="-fly"><div>');
}

function summonTractor(){
    if(!canSpawnTractor){
        return;
    }
    let positionX = 
    $("#container").append(`<div class="tractor -movement"></div>`);
    $(".airplane").css("left", positionX);
    canSpawnTractor = false;
    
}

function summonPlane(){
    if(!canSpawnPlane){
        return
    }
    let limitHeight = parseInt($("#container").css("height"));
    let maxHeight = Math.floor(0.75 * limitHeight);
    let minHeight = Math.floor(0.35 * limitHeight);
    let positionX = 2 * spawnEnemyPosition;
    let positionY = parseInt( Math.random() * (maxHeight - minHeight) + minHeight);
    $("#container").append(`<div class="airplane -fly"><div>`);
    $(".airplane").css("bottom", positionY);
    $(".airplane").css("left", positionX);
    canSpawnPlane = false;
}

function moveBackground(){
    currentPosition = parseInt( $("#container").css("background-position") );
    $("#container").css("background-position", currentPosition - step);
}

function moveTractor(){
    if(!$(".tractor").length){
        summonTractor();
        return;
    }
    currentPosition = parseInt( $(".tractor").css("left") );
    $(".tractor").css("left", currentPosition - step);
    if (currentPosition <= 0){
        $(`.tractor`).remove();
        canSpawnTractor = true;
        summonTractor();
        return;
    }
}

function movePlane(){
    if(!$(".airplane").length){
        console.log("no plane, awaiting respawn");
        summonPlane();
        return;
    }
    var currentPosition = parseInt( $(".airplane").css("left") );
    console.log("entered here");
    if (currentPosition <= 0){
        $(`.airplane`).remove();
        canSpawnPlane = true;
        summonPlane();
        return;
    }
    $(".airplane").css("left", currentPosition - 1.5*step);
    
}

function movePlayer(){
    $("body").keydown(function(event){
        if(!keyFlag){
            pressing(event.key);
            keyFlag = true;
        }
    })
    $("body").keyup(function(){
        keyFlag = false;
    });
}

function moveUp(){
    if (checkBorder()){
        return;
    }
    $("#player").animate({bottom: `+=${6*step}`}, "fast");
    return;
}

function moveDown(){
    if (checkBorder("bottom")){
        return;
    }
    $("#player").animate({bottom: `-=${6*step}`}, "fast");
    return;
}

// Stil need some changes
function shoot(){
    createShot();
    moveShot();    
}

function createShot(){
    if(!canShot){
        return
    }
    let playerPosY = parseInt($("#player").css("bottom"));
    $("#container").append('<div class="projectile"></div>');
    $(".projectile").css("bottom", playerPosY + 5);
    $(".projectile").css("left", 150);
    canShot = false;
}

function moveShot(){
    if(!$(".projectile").length){
        return;
    }
    setInterval(function(){
        $(".projectile").animate({left: `+=${10*step}`}, {
        duration: 100, iteration: Infinity
        });
        let position = parseInt($(".projectile").css("right"));
        let colided = checkCollision(".airplane", ".projectile");
        if (colided){
            console.log("hit landed");
            $(".projectile").remove();
            addExplosion(".airplane");
            // $(".airplane").remove();
            canSpawnPlane = true;
            canShot = true;
            return;
        }
        if (position <= 0){
            $(".projectile").remove();
            canShot = true;
            return;
        }
    }, 100)
}

function getCoordinates(element){
    let $_element = $(element);
    let X0 = parseInt($_element.position().left);
    let Y0 = parseInt($_element.position().top);
    let width = $_element.width();
    let height = $_element.height();
    return {"X0": X0, "width": width, "Y0": Y0, "height": height};
}

function checkCollision(elementA, elementB){
    if(!$(elementA).length || !$(elementB).length){
        return false;
    }
    let A = getCoordinates(elementA);
    let B = getCoordinates(elementB);
    return A.X0 + A.width >= B.X0 && A.X0 <= B.X0 + B.width 
        && A.Y0 + A.height>= B.Y0 && A.Y0 <= B.Y0 +B.height;
}

function checkBorder(check="top"){
    var limitHeight = parseInt($("#container").css("height"));
    var position = parseInt($("#player").css("bottom"));
    var height = parseInt($("#player").css("height"));
    console.log(position, height, limitHeight);
    return check === "top" ? position >= limitHeight - height : position <= height;
}

function addExplosion(entity){
    $(entity).addClass("-boom");
}


function gameOver(){

}


