// html element vars
const player = document.getElementById('player')
const sword = document.getElementById('sword')
const gameArea = document.getElementById('gameArea')
const enemy = document.getElementById('enemy')
const endScreen = document.getElementById('endScreen')
const scoreCounter = document.getElementById('score')

// global vars
let playingGame = true
let score = 0
let highScore = 0

// input vars
let up = false
let down = false
let left = false
let right = false

// player vars
// center player
let x = gameArea.clientWidth / 2
let y = gameArea.clientHeight / 2
// position vars
let xVel
let yVel
let speed = 2
let mouseX = 0
let mouseY = 0

// enemy vars
let enemyX = x
let enemyY = y
let enemySpeed = .75
let enemyRot = 0

// delta calculations
let lastTime = 0
let delta = 0


function randRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// check when keys are down
document.body.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W'){
        up = true
    }
    if(e.key === 'ArrowDown' || e.key === 's' || e.key === 'S'){
        down = true
    }
    if(e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A'){
        left = true
    }
    if(e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D'){
        right = true
    }
})
// check when keys are up
document.body.addEventListener('keyup', (e)=>{
    if(e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W'){
        up = false
    }
    if(e.key === 'ArrowDown' || e.key === 's' || e.key === 'S'){
        down = false
    }
    if(e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A'){
        left = false
    }
    if(e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D'){
        right = false
    }
})

// get mouse pos
gameArea.addEventListener('mousemove', (e)=>{
    // normalize position with bounds of game area
    mouseX = e.clientX - gameArea.getBoundingClientRect().left
    mouseY = e.clientY - gameArea.getBoundingClientRect().top
    // console.log(`${mouseX}, ${mouseY}`)
})

// checks which keys are down and applies velocity to change position
function setVel() {
    xVel = 0
    yVel = 0
    
    yVel += down ? 1 : 0
    yVel -= up ? 1 : 0
    xVel += right ? 1 : 0
    xVel -= left ? 1 : 0

    // prevent fast diagnal movement
    if (xVel != 0 && yVel != 0) {
        xVel *= Math.cos(45)
        yVel *= Math.cos(45)
    }
}

// is element 1 colliding with element2
function isColliding(element1, element2) {
    let solid = false
    
    let rect1 = element1.getBoundingClientRect()
    let rect2 = element2.getBoundingClientRect()

    if (!(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.top > rect2.bottom ||
        rect1.bottom < rect2.top)){
            solid = true
        }
    if (!(rect1.right < rect2.left ||
        rect1.top > rect2.bottom ||
        rect1.left > rect2.right ||
         rect1.bottom < rect2.top)){
            solid = true
    }
    
    return solid
}

// check for collision or out of bounds by moving then if colliding, move back
function tryMove(xChange, yChange){
    x += xChange
    updatePos(player, x, y)
    if (x < (player.clientWidth / 2) - 2 || x > gameArea.clientWidth - (player.clientWidth / 2) + 2) {
        x -= xChange
        updatePos(player, x, y)
    }

    y += yChange
    updatePos(player, x, y)
    if (y < (player.clientWidth / 2) - 2 || y > gameArea.clientHeight - (player.clientWidth / 2) + 2) {
        y -= yChange
        updatePos(player, x, y)
    }
}

// set position with css
function updatePos(element, posX ,posY) {
    element.style.top = posY + 'px'
    element.style.left = posX + 'px'
}

// set velocity then move player
function movePlayer() {
    setVel()
    tryMove(xVel * speed * delta, yVel * speed * delta)
    
    // console.log(`${x}, ${y}`)
}

// player moves with inputs and sword points towards mouse
function playerLoop() {
    movePlayer()
    sword.style.transform = `rotate(${pointTowards(x, y, mouseX, mouseY) + 90}deg)`

    // end game if player is touching enemy
    if (isColliding(player, enemy)) {
        playingGame = false
        showEndScreen()
    }
}

// gets angle between two points and points element in that dir
function pointTowards(fromX, fromY, toX, toY) {
    let dx = toX - fromX
    let dy = toY - fromY
    return Math.atan2(dy, dx) * 180 / Math.PI
}

// get pos of move dist steps in dir
function getSteps(dir, dist) {
    let rad = dir * (Math.PI / 180)
    let newX = Math.cos(rad) * dist
    let newY = Math.sin(rad) * dist
    let pos = [newX, newY]

    // console.log(pos)
    return pos
}

function getDist(x1, y1, x2, y2) {
    dx = x2 - x1
    dy = y2 - y1
    return Math.sqrt((dx ** 2) + (dy ** 2))
}

// move enemy to random pos 
function newEnemy() {
    enemyX = randRange(0, gameArea.clientWidth)
    enemyY = randRange(0, gameArea.clientHeight)
    // enemyX = 0
    // enemyY = 0

    updatePos(enemy, enemyX, enemyY)
    if (isColliding(enemy, player) || isColliding(enemy, sword) || getDist(enemyX, enemyY, x, y) < 125) {
        newEnemy()
    }
}

// enemy chases player and is killed when touching sword
function enemyLoop() {
    if (isColliding(enemy, sword)) {
        newEnemy()
        score++
    }

    enemyRot = pointTowards(enemyX, enemyY, x, y)
    enemy.style.transform = `rotate(${enemyRot}deg)`

    // scale enemy speed
    enemySpeed = .75 + score / 100
    
    // console.log(`${enemyX}, ${enemyY}`)
    // console.log(enemyRot)
    enemyX += getSteps(enemyRot, enemySpeed * delta)[0]
    enemyY += getSteps(enemyRot, enemySpeed * delta)[1]
    updatePos(enemy, enemyX, enemyY)
}

function updateScore() {
    scoreCounter.textContent = `Score: ${score}`
}

function setHighScore() {
    if (score > highScore) {highScore = score}
}

function gameLoop(currentTime) {
    // set delta
    delta = (currentTime - lastTime) / 10
    lastTime = currentTime
    // console.log(delta)

    // gameplay functions
    playerLoop()
    enemyLoop()
    updateScore()

    // loop the function every frame
    if(playingGame) {
        requestAnimationFrame(gameLoop)
    }
}

// set up game to start, then begin loop
function startGame() {
    playingGame = true
    
    // player reset
    x = gameArea.clientWidth / 2
    y = gameArea.clientHeight / 2
    updatePos(player, x, y)
    
    // enemy reset
    newEnemy()

    score = 0
    
    // ui setup
    endScreen.style.display = 'none'
    scoreCounter.style.display = 'block'
    
    // start game lopp
    requestAnimationFrame(gameLoop)
}

// show end screen with restart button
function showEndScreen() {
    setHighScore()

    scoreCounter.style.display = 'none'
    endScreen.getElementsByTagName('h3')[0].textContent = `Score: ${score}`
    endScreen.getElementsByTagName('h3')[1].textContent = `High Score: ${highScore}`
    endScreen.style.display = 'flex'
}

startGame()