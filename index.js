
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

function summonPlayer(){
    $("#container").append('<div id="player" class="-fly"><div>');
}

function summonTractor(){
    if(!canSpawnTractor){
        return;
    }
    $("#container").append(`<div class="tractor -movement"></div>`);
    canSpawnTractor = false;
    
}

function summonPlane(){
    if(!canSpawnPlane){
        return
    }
    var limitHeight = parseInt($("#container").css("height"));
    var maxHeight = Math.floor(0.75 * limitHeight);
    var minHeight = Math.floor(0.35 * limitHeight);
    positionY = parseInt( Math.random() * (maxHeight - minHeight) + minHeight);
    $("#container").append(`<div class="airplane -fly"><div>`);
    $(".airplane").css("bottom", positionY);
    canSpawnPlane = false;
}

function moveBackground(){
    currentPosition = parseInt( $("#container").css("background-position") );
    $("#container").css("background-position", currentPosition - step);
}

function moveTractor(){
    if(!$(".tractor")){
        return;
    }
    currentPosition = parseInt( $(".tractor").css("left") );
    $(".tractor").css("left", currentPosition - step);
    if (currentPosition <= 0){
        $(`.tractor`).remove();
        canSpawnTractor = true;
        summonTractor();
    }
}

function movePlane(){
    currentPosition = parseInt( $(".airplane").css("left") );
    if (currentPosition <= 0){
        $(`.airplane`).remove();
        canSpawnPlane = true;
        setTimeout(summonPlane(), 2500);
        return;
    }
    $(".airplane").css("left", currentPosition - 2*step);
    
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

function gameLoop(){
    moveBackground();
    moveTractor();
    movePlayer();
    movePlane();
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
    playerPosY = parseInt($("#player").css("bottom"));
        $("#container").append('<div class="projectile"></div>');
        $(".projectile").css("bottom", playerPosY + 5);
        $(".projectile").css("left", 150);
        canShot = false;
}

function moveShot(){
    if (checkHitLanded()){
        $(".projectile").remove();
        return;
    }
    setInterval(function(){
        $(".projectile").animate({left: `+=${10*step}`}, {
        duration: 100, iteration: Infinity
        });
        position = parseInt($(".projectile").css("right"));
        if (position <= 0){
            $(".projectile").remove();
            canShot = true;
        }
    }, 100)
}

function getCoordinates(element){
    var $_element = $(element);
    var X0 = parseInt($_element.position().left);
    var Y0 = parseInt($_element.position().top);
    var width = $_element.width();
    var height = $_element.height();
    return {"X0": X0, "width": width, "Y0": Y0, "height": height};
}

function checkCollision(elementA, elementB){
    var A = getCoordinates(elementA);
    var B = getCoordinates(elementB);
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
    setTimeout(() => {
        $(entity).removeClass("-boom");
        // $(entity).remove();
    }, 1500);
}

function checkHitLanded(){
    if(!$(".projectile").legth || $(".airplane").legth){
        return false;
    }
    return checkCollision(".projectile", ".airplane")
}

function gameOver(){

}


