let Game = {
    startX: 205,
    startY: 385,
    score: 0,
    time: 0,
    timer: setInterval(function(){
        Game.time++;
    }, 500),
    lanes: [57, 139, 221],
    activeEnemies: 0,
    maxEnemies: 5,
    enemySpeedMultiplier: 0,
    scoreReachTop: 100,
    scoreGemBlue: 70,
    scoreGemGreen: 50,
    scoreGemOrange: 25,
    lastEnemySpawn: 0,
    lastGemSpawn: 0
};

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';    
    this.baseSpeed = 80;
    this.maxExtraSpeed = 120;
    this.addSpeed = Math.floor(Math.random() * this.maxExtraSpeed);
    
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    this.x += (this.baseSpeed + this.addSpeed) * dt + (Game.enemySpeedMultiplier / 2);

    if (this.x > 520) {
        this.x = -120;
        this.y = Game.lanes[Math.floor(Math.random()*3)];
        this.addSpeed = Math.floor(Math.random() * this.maxExtraSpeed);
    }

    
    if (this.y < player.y + 30 && 
        this.y > player.y - 30 && 
        this.x < player.x + 60 && 
        this.x > player.x - 70 ) {

        player.x = Game.startX;
        player.y = Game.startY;

        Game.time = 0;
        Game.score = 0;
        Game.enemySpeedMultiplier = 0;
        scoreBoard.innerHTML = 'score: ' + Game.score;

    }

};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {

    this.x = Game.startX;
    this.y = Game.startY;
    this.sprite = 'images/char-boy.png';
};

Player.prototype.update = function (dt) {

    if (Game.lastEnemySpawn < Game.time) {

        let i = null;

        if (Game.activeEnemies < Game.maxEnemies) {
            
            i = Game.activeEnemies;

            allEnemies[i] = new Enemy();
            allEnemies[i].x = -100 - (Math.floor(Math.random() * 160));

            if (Game.activeEnemies < 2) {
                allEnemies[i].y = Game.lanes[0];
            } else if (i > 1 && i < 4) {
                allEnemies[i].y = Game.lanes[1];
            } else {
                allEnemies[i].y = Game.lanes[2];
            }

            Game.activeEnemies++;

            Game.lastEnemySpawn = Game.time;
        }

    }

    if (this.y < -20) {
        this.x = Game.startX;
        this.y = Game.startY;
        Game.score += Game.scoreReachTop;
        Game.enemySpeedMultiplier += 1;
        scoreBoard.innerHTML = 'score: ' + Game.score;
    }
};

Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function (key) {
    
    const ySpeed = 82;
    const xSpeed = 100;

    switch (key) {
        case 'up':
            this.y = this.y - ySpeed;
            break;
        case 'down':
            this.y = this.y + ySpeed;
            break;
        case 'left':
            this.x = this.x - xSpeed;
            break;
        case 'right':
            this.x = this.x + xSpeed;
            break;
    }

    if (this.x < 5) this.x = 5;
    if (this.y > 385) this.y = 385;
    if (this.x > 405) this.x = 405;
    if (this.y < -25) this.y = -25;

};

var Gem = function() {
    this.offsetY = 50;
    this.gemShow = false;
    this.gemShowInterval = 15;
    this.gemTimeTaken = 0;
    this.possibleX = [  105, 
                        205, 
                        305, 
                        405 ];
    this.possibleY = [  Game.lanes[0] + this.offsetY, 
                        Game.lanes[1] + this.offsetY, 
                        Game.lanes[2] + this.offsetY ];
    this.x = -200;
    this.y = -200;
    this.sprite = 'images/Gem Green.png';
};

Gem.prototype.update = function (dt) {

    if (!this.gemShow) {
        if (Game.time == this.gemShowInterval ||
            Game.time == this.gemTimeTaken + this.gemShowInterval) {

            this.x = this.possibleX[ Math.floor(Math.random()*4) ];
            this.y = this.possibleY[ Math.floor(Math.random()*3) ];

            this.gemShow = true;
            Game.lastGemSpawn = Game.time;

            console.log('gem spawned');
        }
    }

    if (this.y - this.offsetY == player.y && 
        this.x == player.x) {

        this.gemObtained();

        console.log('this.gemTimeTaken: ' + this.gemTimeTaken);
        console.log('this.gemShowInterval: ' + this.gemShowInterval);
        console.log('Game.lastGemSpawn: ' + Game.lastGemSpawn);
        console.log('Game.time: ' + Game.time);

        console.log('gem taken!');
    }
};

Gem.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 90, 100);
};

Gem.prototype.gemObtained = function () {
    this.resetGem();
    this.gemTimeTaken = Game.time;

    Game.score += Game.scoreGemBlue;
    scoreBoard.innerHTML = 'score: ' + Game.score;
};

Gem.prototype.resetGem = function () {
    this.gemShow = false;
    this.x = -200;
    this.y = -200;
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

let allEnemies = [];
let player = new Player();
let gem = new Gem();
let scoreBoard = document.querySelector('.score');
scoreBoard.innerHTML = 'score: ' + Game.score;

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
