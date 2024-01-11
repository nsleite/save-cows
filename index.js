
var step = 5; // pixel
var game = {};
var keyFlag = false;
var canShot = true;
var canSpawnPlane = true, canSpawnTractor = true, canSpawnCow = true;
var spawnEnemyPosition = 1000;
var cowCanColide = true, tractorCanColide = true; canBeAbducted = true;
var score = 0, kills = 0, saved = 0,beefs = 0;


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
    clearScreen();
    appendScore();
    summonPlayer();
    summonTractor();
    summonPlane();
    summonCow();

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
    MoveCow();
    updateScore();
}

function summonPlayer(){
    $("#container").append('<div id="player" class="-fly"><div>');
}

function summonTractor(){
    if(!canSpawnTractor){
        return;
    }
    let positionX = 1.15 * spawnEnemyPosition;
    $("#container").append(`<div class="tractor -movement"></div>`);
    $(".tractor").css("left", positionX);
    tractorCanColide = true;
    canSpawnTractor = false;
    
}

function summonPlane(){
    if(!canSpawnPlane){
        return
    }
    let limitHeight = parseInt($("#container").css("height"));
    let maxHeight = Math.floor(0.75 * limitHeight);
    let minHeight = Math.floor(0.35 * limitHeight);
    let positionX = 2.5 * spawnEnemyPosition;
    let positionY = parseInt( Math.random() * (maxHeight - minHeight) + minHeight);
    $("#container").append(`<div class="airplane -fly"><div>`);
    $(".airplane").css("bottom", positionY);
    $(".airplane").css("left", positionX);
    canSpawnPlane = false;
}

function summonCow(){
    if(!canSpawnCow){
        return;
    }
    let positionX = 0.8 * spawnEnemyPosition;
    $("#container").append(`<div class="cow"></div>`);
    $(".cow").css("left", positionX);
    cowCanColide = true;
    canBeAbducted = true;
}

function moveBackground(){
    let currentPosition = parseInt( $("#container").css("background-position") );
    $("#container").css("background-position", currentPosition - step);
}

function moveTractor(){
    if(!$(".tractor").length){
        summonTractor();
        return;
    }
    let currentPosition = parseInt( $(".tractor").css("left") );
    $(".tractor").css("left", currentPosition - 1.43 * step);
    if (currentPosition <= 0){
        $(`.tractor`).remove();
        canSpawnTractor = true;
        summonTractor();
        return;
    }
}

function movePlane(){
    if(!$(".airplane").length){
        summonPlane();
        return;
    }
    let currentPosition = parseInt( $(".airplane").css("left") );
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
    let abduction = checkCollision("#player", ".cow");
    let planeCollision = checkCollision("#player", ".airplane");
    let tractorCollision = checkCollision("#player",".tractor");
    if(canBeAbducted && abduction){
        $(".cow").addClass("-abducted");
        cowCanColide = false;
        canBeAbducted = false;
        saved += 1.2;
        return;
    }
    if(planeCollision || ( tractorCollision && tractorCanColide) ){
        gameOver();
    }
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

function MoveCow(){
    if(!$(".cow").length){
        summonCow();
        return;
    }
    let currentPosition = parseInt( $(".cow").css("left") );
    let colided = checkCollision(".cow", ".tractor");
    $(".cow").css("left", currentPosition - step);
    if (currentPosition <= 0){
        $(`.cow`).remove();
        saved -= 0.2;
        summonCow();
        return;
    }
    if (cowCanColide && tractorCanColide && colided){
        $(`.cow`).remove();
        beefs += 1;
        // add beef animation
        return;
    }
}

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
        let shotPlane = checkCollision(".projectile", ".airplane");
        let shotTractor = checkCollision(".projectile", ".tractor");
        if (shotPlane){
            $(".projectile").remove();
            $(".airplane").addClass("-boom");
            canSpawnPlane = true;
            shotPlane = false;
            canShot = true;
            kills += 1;
            return;
        }
        if(shotTractor){
            $(".projectile").remove();
            $(".tractor").addClass("-baam");
            tractorCanColide = false;
            canSpawnTractor = true;
            shotTractor = false;
            canShot = true;
            kills += 0.5;
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
    return check == "top" ? position >= limitHeight - 2 * height : position <= height;
}

function gameOver(){
    clearScreen();
    clearInterval(game.timer);
    game.timer = null;
    restart();
}

function restart(){
    score = (100*kills) + (100*saved) - (50*beefs);
    $(".init h2").text("GAME OVER");
    $(".init h3").text(`Final Score: ${score}`);
    $(".init button").text("RESTART");
    score = kills = saved = beefs = 0;
    $(".init").show()
}

function clearScreen(end=false){
    if($(".airplane").length){
        $(".airplane").remove();
        canSpawnPlane = true;
    }
    if($(".cow").length){
        $(".cow").remove();
        canSpawnCow = true;
    }
    if($(".tractor").length){
        $(".tractor").remove();
        canSpawnTractor = true;
    }
    if($("#player").length){
        $("#player").remove();
    }
    if($(".score").length){
        $(".score").remove();
    }
    $(".init").hide();    
}

function appendScore(){
    $("#container").append(`<div class="score"><h2></h2><h3></h3></div>`);
    $(".score h2").text(`kills: ${kills}    saved: ${saved}    beefs: ${beefs}`);
}

function updateScore(){
    $(".score h2").text(`kills: ${kills}    saved: ${saved}    beefs: ${beefs}`);
}