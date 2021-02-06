
let canvas = document.getElementById('canvas'); //assigns canvas element to variable
let context = canvas.getContext('2d'); //returns drawing object which has access to drawing functions and properties
let myObstacles = []; //array that will hold all obstacle objects
let myLeftObstacles = []; //obstacles drawn from the left side of canvas
let myRightObstacles = [];
let frameCounter = 0; //number of frames counter
let frameInterval = 25; //interval where obstacles are created
let lives = 3; //variable to hold current lives of player
let game;

//level difficulty
function easy(){
    frameInterval = 100;
}
function medium(){
    frameInterval = 25;
}
function hard(){
    frameInterval = 10;
}
function impossible(){
    frameInterval = 5;
}

//function to draw lives of the player
function drawScore() {
    context.font = "16px Arial";
    context.fillStyle = "#0095DD";
    context.fillText("Lives: "+ lives, 8, 20); //draws text at coordinate (8,20)
}

/*
helper function that returns a boolean value.
    true: if frame is a multiple of n (n, 2n, 3n, 4n .... xn)
    false: if frame number is not a multiple of n
*/
function everyinterval(n) {
    if ((frameCounter / n) % 1 == 0) { //if frame is multiple of n, left side of equation evalutes to zero
        return true;}
    return false;
}

/*
drawObstacles() function will push a new obstacle onto the myObstacles array whenever frame number is 1
or a multiple of the value fed onto the everyinterval() function. For each obstacle object in the array
we update it's x-coordinate
 */
function drawObstacles(){
    if (frameCounter == 1 || everyinterval(frameInterval)){
        let rightOb = new obstacleGenerator(canvas.width);
        let leftOb = new obstacleGenerator(0);

        myRightObstacles.push(rightOb);
        myLeftObstacles.push(leftOb);

        myObstacles.push(rightOb, leftOb);

    }

    for (let i = 0; i < myRightObstacles.length; i += 1) {
        myRightObstacles[i].x += -1;
        myLeftObstacles[i].x += 1;

        myLeftObstacles[i].draw();
        myRightObstacles[i].draw();
    }

}

/*
obstacleGenerator() function will generate new obstacles and draw them onto the canvas
 */
function obstacleGenerator(xCoor){
    let maxHeight = canvas.height - 50;
    let minHeight = 10;
    this.x = xCoor;
    this.y = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
    this.vx = 1;
    this.radius = 5;
    this.color = 'blue';
    this.draw = function() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fillStyle = this.color;
        context.fill();
    }

}

/*
This object will be our main player.
 */
let ball = {
    radius: 10, //radius of player ball
    x: canvas.width/2, //starts in the middle of x-axis
    y: canvas.height - 10, //since radius is 10, we subtract canvas height to ensure player is visible
    vx: 5, //x velocity of player
    vy: 5, //y velocity of player
    color: 'black', //player color
    draw: function() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        context.closePath();
        context.fillStyle = this.color;
        context.fill();
    }
};



/*
This update() function will be called by the setInterval at a specified interval.
At Each interval, it executes the following
        -updates frame counter
        -clears all pixels currently in our canvas
        -redraws all figures of interest: (1) Player Lives (2) Player (3) obstacles
        -checks if game has concluded (player wins or loses)
        -checks if keyboards are pressed, if so update player speed accordinly
*/
function update(){
    frameCounter += 1;
    context.clearRect(0,0, canvas.width, canvas.height); //Erases Pixels in our Canvas
    drawScore();
    ball.draw(); //Re-draw the ball
    drawObstacles();

    isGameOver();


    if(isPressed.right){
        ball.x += ball.vx; //update x-coordinate
    }
    else if(isPressed.left){
        ball.x -= ball.vx; //update x-coordinate
    }
    if(isPressed.up){
        ball.y -= ball.vy; //update y-coordinate
    }
    else if(isPressed.down){
        ball.y += ball.vy; //update y-coordinate
    }

}

/*
object that hold boolean attributes to identify whether a certain arrow key is being pressed
The Event Handlers will toggle the value of each attribute accordingly. These values will
be utilized in the update() function to ascertain the chosen direction of the player and update
player speed accordingly.
*/
let isPressed = {
    right: false,
    left: false,
    up: false,
    down: false

}

/*
even handlers that toggle the value of the attributes of the isPressed object
according to the keys pressed by the user
*/
function keyDownHandler(event){
    event.preventDefault(); //prevents from default event handler from executing (prevents scrolling)
    if(event.key == "ArrowLeft"){
        isPressed.left = true;
    }
    else if(event.key == "ArrowUp"){
        isPressed.up = true;
    }
    else if(event.key == "ArrowRight"){
        isPressed.right = true;
    }
    else if(event.key == "ArrowDown"){
        isPressed.down = true;
    }

}

function keyUpHandler(event){
    event.preventDefault();
    if(event.key == "ArrowLeft"){
        isPressed.left = false;
    }
    else if(event.key == "ArrowUp"){
        isPressed.up = false;
    }
    else if(event.key == "ArrowRight"){
        isPressed.right = false;
    }
    else if(event.key == "ArrowDown"){
        isPressed.down = false;
    }

}


/*
isGameOver() function will check the status of the game conditions
    -Player wins when player icon has reached the top unharmed
    -Player loses a life if it collides with an obstacle
        -If player has no lives remaining, player loses the game
*/
function isGameOver(){
    if(ball.y == 0){ //when y-coordinate of player reaches 0 (top of canvas), player wins
        alert("You Win!");
        document.location.reload(); //reloads page, like a refresh button
        clearInterval(interval); // Needed for Chrome to end game
    }
    //if a collision is detected, decrease player lives by one
    //and redraw the play at initial position
    if(collisionDetection()){
        lives -= 1;
        ball.x = canvas.width/2;
        ball.y = canvas.height - 10;
        if(lives == 0) { //if player lives reach 0, game is over and page is reloaded
            alert("You Lose");
            document.location.reload(); //reloads page, like a refresh button
            clearInterval(interval); // Needed for Chrome to end game
        }
    }

}

/*
collisionDetection() returns true is collision between player and obstacle is detected
        To detect the collision of two balls, we test whether the distance between
        the center of the two balls is less than the sum of their radii.
*/
function collisionDetection(){
    let collision = false; //state of collision

    //Loops through myObstacles[] array to test each element
    for(let i = 0; i < myObstacles.length; i += 1){
        let dx = ball.x - myObstacles[i].x; //x-coordinate distance
        let dy = ball.y - myObstacles[i].y; //y-coordinate distance
        let distance = Math.sqrt(dx * dx + dy * dy); //distance of the centers of player and obstacle

        if (distance < ball.radius + myObstacles[i].radius) { //if their combined radius is grater, collision detected
            collision = true;
            break; //no need to test remaining obstacles, one collision is enough
        }
    }
    return collision;
}


//when any key is pressed down, execute the keyDownHandler function
document.addEventListener('keydown', keyDownHandler, false);
//when key is released, execute the keyUpHandler function
document.addEventListener('keyup', keyUpHandler, false);


/*
setInterval() method calls the update() function every 25 milliseconds
1 second = 1000 ms, as such the update() function is called 40 times a second
 */
function startGame(){
    game = setInterval(update, 25);
}

function pauseGame(){
    clearInterval(game);
}

function resetGame(){
    location.reload();
}


//ball.draw();