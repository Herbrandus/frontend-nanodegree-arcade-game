// store all game data in one Game object
const Game = {
    // show character selection if the game is not started
    // show game, player, gems and enemies when the game is started
    gameStarted: false,

    // starting position of player
    startX: 205,
    startY: 385,

    // initial score
    score: 0,

    // game time at start of game
    time: 0,
    timer: setInterval(function(){
        Game.time++;
    }, 500),

    // array to store enemy objects in
    allEnemies: [],

    // variable to store player object in
    player: null,

    // variable to store gem object in
    gem: null,

    // scoreboard
    scoreBoard: document.querySelector('.score'),

    // y position options for enemies to spawn on
    lanes: [57, 139, 221],

    // amount of enemies active
    activeEnemies: 0,

    // maximum amount of enemies
    maxEnemies: 5,

    // this is increased every time the player reaches the water
    enemySpeedMultiplier: 0,

    // scores
    scoreReachTop: 100,
    scoreGem: 50,

    // when was the last enemy or gem spawned
    lastEnemySpawn: 0,
    lastGemSpawn: 0
};


// character selector object before the game starts
var CharSelector = function() {
    this.x = 50;
    this.y = 210;
    this.sprite = 'images/Selector.png';
};

CharSelector.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

CharSelector.prototype.handleInput = function (key) {

    // this is only active before the game commences
    if (!Game.gameStarted) {

        // controls for selecting your favorite character
        switch (key) {
            case 'left':
                if (this.x > 50) {
                    this.x = this.x - 100;    
                }                
                break;
            case 'right':
                if (this.x < 350) {
                    this.x = this.x + 100;    
                }                
                break;
            case 'space':
            case 'enter':
                // select player by hitting space or enter
                this.choosePlayer(this.x);
                break;
        }
    }
};

CharSelector.prototype.choosePlayer = function (position) {

    // start game depending on the x position the character selector object is
    switch(position) {
        // relate the x position to the 4 available characters
        case 50:
            this.startGame(charOption1.spriteChoices[0]);
            break;
        case 150:
            this.startGame(charOption1.spriteChoices[1]);
            break;
        case 250:
            this.startGame(charOption1.spriteChoices[2]);
            break;
        case 350:
            this.startGame(charOption1.spriteChoices[3]);
            break;
    }
}

CharSelector.prototype.startGame = function (sprite) {

    // remove character options and selector from game
    delete charOption1;
    delete charOption2;
    delete charOption3;
    delete charOption4;
    delete selector;

    // the game has now started
    Game.gameStarted = true;

    // create true player object
    Game.player = new Player();
    Game.player.sprite = sprite;

    // create gem
    Game.gem = new Gem();

    // edit scoreboard for score display
    Game.scoreBoard.style.float = 'right';
    Game.scoreBoard.innerHTML = 'score: ' + Game.score;

};

// Enemies our player must avoid
var Enemy = function() {

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

    // reset position when out of screen
    if (this.x > 510) {
        this.x = -120;
        this.y = Game.lanes[Math.floor(Math.random()*3)];
        this.addSpeed = Math.floor(Math.random() * this.maxExtraSpeed);
    }

    // collision detection with player
    if (this.y < Game.player.y + 30 && 
        this.y > Game.player.y - 30 && 
        this.x < Game.player.x + 60 && 
        this.x > Game.player.x - 70 ) {

        // defeat!
        Game.player.reset();
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

    // available character sprites
    this.spriteChoices = [
                'images/char-boy.png',
                'images/char-cat-girl.png',
                'images/char-horn-girl.png',
                'images/char-pink-girl.png'
        ];

    // set starting position and sprite
    this.x = Game.startX;
    this.y = Game.startY;
    this.sprite = this.spriteChoices[0];
};

Player.prototype.update = function (dt) {

    // only operational after the game has started
    if (Game.gameStarted) {

        // create enemies in player object because it is already created
        // and it needs an update function to create the enemies in a timely fashion
        // not all at the same time
        if (Game.lastEnemySpawn < Game.time) {

            // custom iterator
            let i = null;

            // only create as many enemies as allowed by maxEnemies
            if (Game.activeEnemies < Game.maxEnemies) {
                
                i = Game.activeEnemies;

                // add new enemy to allEnemies array and set random x position
                Game.allEnemies[i] = new Enemy();
                Game.allEnemies[i].x = -100 - (Math.floor(Math.random() * 160));

                // depending on the enemy number, place the enemy in a different y position
                if (Game.activeEnemies < 2) {
                    Game.allEnemies[i].y = Game.lanes[0];
                } else if (i > 1 && i < 4) {
                    Game.allEnemies[i].y = Game.lanes[1];
                } else {
                    Game.allEnemies[i].y = Game.lanes[2];
                }

                Game.activeEnemies++;

                Game.lastEnemySpawn = Game.time;
            }

        }
    }

    // when the player reaches the water
    if (this.y < -20) {
        Game.player.win();
    }
};

Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// function for when the player reaches the water
Player.prototype.win = function () {

    this.x = Game.startX;
    this.y = Game.startY;
    Game.score += Game.scoreReachTop;
    Game.enemySpeedMultiplier += 1;
    Game.scoreBoard.innerHTML = 'score: ' + Game.score;
};

// function for when the player gets hit or the game resets
Player.prototype.reset = function () {

    Game.player.x = Game.startX;
    Game.player.y = Game.startY;

    Game.time = 0;
    Game.score = 0;
    Game.enemySpeedMultiplier = 0;
    Game.scoreBoard.innerHTML = 'score: ' + Game.score;
};

// handle controls for the player
Player.prototype.handleInput = function (key) {
    
    const ySpeed = 82;
    const xSpeed = 100;

    if (Game.gameStarted) {
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
    }

};


// Gem object
var Gem = function() {
    
    // offset in y position to place it nicely on a tile
    this.offsetY = 50;
    this.gemShow = false;
    this.gemShowInterval = 15;
    this.gemTimeTaken = 0;

    // possible positions on x axis
    this.possibleX = [  105, 
                        205, 
                        305, 
                        405 ];

    // possible positions on y axis
    this.possibleY = [  Game.lanes[0] + this.offsetY, 
                        Game.lanes[1] + this.offsetY, 
                        Game.lanes[2] + this.offsetY ];

    // place gem off screen
    this.x = -200;
    this.y = -200;

    // use the green gem sprite
    this.sprite = 'images/Gem Green.png';
};

Gem.prototype.update = function (dt) {

    // only active in started game
    if (Game.gameStarted) {        
        
        // if there is no gem shown in the playing field
        if (!this.gemShow) {
            // if 15 time units have passed or
            // if 15 time units have passed after the last gem was picked up
            if (Game.time == this.gemShowInterval ||
                Game.time == this.gemTimeTaken + this.gemShowInterval) {

                // put gem back in playing field
                this.gemCreation();
            }
        }

        // collision detection
        if (this.y - this.offsetY == Game.player.y && 
            this.x == Game.player.x) {

            this.gemObtained();
        }
    }
};

Gem.prototype.gemCreation = function () {

    // determine new position
    this.x = this.possibleX[ Math.floor(Math.random()*4) ];
    this.y = this.possibleY[ Math.floor(Math.random()*3) ];

    // show gem
    this.gemShow = true;
    Game.lastGemSpawn = Game.time;
};

Gem.prototype.render = function () {
    // render gem and resize it a bit to a smaller size
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 90, 100);
};

Gem.prototype.gemObtained = function () {
    this.resetGem();
    this.gemTimeTaken = Game.time;

    // edit score
    Game.score += Game.scoreGem;
    Game.scoreBoard.innerHTML = 'score: ' + Game.score;
};

// this resets the position of the gem outside of the screen
Gem.prototype.resetGem = function () {
    this.gemShow = false;
    this.x = -200;
    this.y = -200;
};


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space',
        13: 'enter'
    };
    
    // depending on whether the game is started or not, 
    // handle the input differently
    if (Game.gameStarted) {
        Game.player.handleInput(allowedKeys[e.keyCode]);
    } else {
        selector.handleInput(allowedKeys[e.keyCode]);
    }
});

// Instantiate the player character options as player objects
// and give them the different sprites available

let selector = new CharSelector()
    charOption1 = new Player(),
    charOption2 = new Player(),
    charOption3 = new Player(),
    charOption4 = new Player();

charOption1.sprite = charOption1.spriteChoices[0];
charOption2.sprite = charOption2.spriteChoices[1];
charOption3.sprite = charOption3.spriteChoices[2];
charOption4.sprite = charOption4.spriteChoices[3];

charOption1.x = 50;
charOption1.y = 210;

charOption2.x = 150;
charOption2.y = 210;

charOption3.x = 250;
charOption3.y = 210;

charOption4.x = 350;
charOption4.y = 210;

Game.scoreBoard.innerHTML = 'Choose your character!';
Game.scoreBoard.style.float = 'none';