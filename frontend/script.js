let player = ""; 
const socket = new WebSocket('ws://localhost:8080'); 
let gamestate = false; 
let myTurn = false;
let gameOver = false;
let winStatus = false;

let myHealth = 100;
let oppHealth = 100;

let arrows = [];
let opponentArrows = [];
const gravity = 0.5; 

socket.onopen = function (event) { 
    alert('You are Connected to WebSocket Server'); 
}; 

socket.addEventListener("message", (event) => { 
    if(event.data.startsWith("player")){ 
        player=event.data; 
    } 
    else if(event.data == "connected"){ 
        gamestate=true;
        gameOver=false; // Ensure game over is cleared when re-connecting
        myHealth=100;
        oppHealth=100;
        healthText.innerText = myHealth;
    }
    else {
        try {
            let msg = JSON.parse(event.data);
            if (msg[0] === "turn") {
                myTurn = msg[1];
            }
            else if (msg[0] === "opponent_shoot") {
                let oppArrow = msg[1];
                oppArrow.x = cwidth * 0.8;
                oppArrow.y = cheight * 0.8 - 150;
                oppArrow.vx = -oppArrow.vx; 
                opponentArrows.push(oppArrow);
            } 
            else if (msg[0] === "health_update") {
                myHealth = msg[1];
                oppHealth = msg[2];
                healthText.innerText = myHealth; 
            }
            else if (msg[0] === "score_update") {
                scorecard.innerText = msg[1];
            }
            else if (msg[0] === "game_over") {
                gamestate = false;
                gameOver = true;
                winStatus = msg[1];
                
                // Immediately send reset state to the server to open matchmaking back up
                socket.send(JSON.stringify(['reset', player]));
            }
        } catch(e) {}
    }

}); 

document.getElementById('findplayer').addEventListener("click", function() { 
    socket.send(JSON.stringify(['findplayer',`${player}`])); 
}); 

window.addEventListener("click", function() {
    if(gamestate && myTurn && !gameOver) {
        let power = 25 + (Math.random() * 2); 
        let vx = power * Math.cos(angle);
        let vy = power * Math.sin(angle);
        
        let arrow = {x: px, y: py, vx: vx, vy: vy};
        arrows.push(arrow);
        
        socket.send(JSON.stringify(['shoot', player, arrow]));
        myTurn = false; 
    }
});

const canvas= document.getElementById("canvas"); 
const ctx = canvas.getContext('2d'); 
const cwidth=canvas.clientWidth; 
const cheight=canvas.clientHeight; 
canvas.width = cwidth; 
canvas.height = cheight; 
const healthText = document.getElementById("healthcount"); 
const scorecard=document.getElementById("score"); 

let mouseX = cwidth / 2; 
let mouseY = cheight / 2; 
window.addEventListener('mousemove', function(event) { 
    const rect = canvas.getBoundingClientRect(); 
    mouseX = event.clientX - rect.left; 
    mouseY = event.clientY - rect.top; 
}); 

function drawPlayer(x, y, color, aimAngle, hp) {
    ctx.beginPath(); 
    ctx.arc(x, y - 150, 30, 0, 2 * Math.PI); 
    ctx.fillStyle = color; 
    ctx.fill(); 
    ctx.lineWidth = 2; 
    ctx.strokeStyle = "black"; 
    ctx.stroke(); 
    
    ctx.beginPath();
    ctx.moveTo(x, y - 120);
    ctx.lineTo(x, y - 40);
    ctx.lineWidth = 8;
    ctx.strokeStyle = color;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x, y - 40);
    ctx.lineTo(x - 20, y);
    ctx.moveTo(x, y - 40);
    ctx.lineTo(x + 20, y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x, y - 100);
    if (aimAngle !== undefined) {
        ctx.lineTo(x + 40 * Math.cos(aimAngle), y - 100 + 40 * Math.sin(aimAngle));
    } else {
        ctx.lineTo(x - 30, y - 70);
    }
    ctx.stroke();
    
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("HP: " + hp, x, y - 195);
}

function drawArrow(a, isOpponent) {
    let arrAngle = Math.atan2(a.vy, a.vx);
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(arrAngle);
    
    ctx.beginPath();
    ctx.moveTo(-40, 0);
    ctx.lineTo(0, 0);
    ctx.lineWidth = 3;
    ctx.strokeStyle = isOpponent ? "red" : "black";
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.lineTo(0, 0);
    ctx.lineTo(-8, 6);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
}

function setup(){ 
    ctx.reset(); 
    
    ctx.fillStyle = "brown"; 
    ctx.fillRect(0, cheight*0.8, cwidth, cheight*0.2); 
    
    px=cwidth*0.2; 
    py=cheight*0.8-150; 
    angle = Math.atan2(mouseY - py, mouseX - px); 
    
    drawPlayer(cwidth*0.2, cheight*0.8, "green", (gamestate && myTurn && !gameOver) ? angle : undefined, myHealth);
    drawPlayer(cwidth*0.8, cheight*0.8, "red", undefined, oppHealth);

    if (gamestate && myTurn && !gameOver) {
        ctx.beginPath();       
        ctx.moveTo(px, py);    
        ctx.lineTo(px + 150*Math.cos(angle),py + 150*Math.sin(angle));  
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.stroke(); 
    }

    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    
    if (gameOver) {
        ctx.font = "60px Arial";
        ctx.fillStyle = winStatus ? "green" : "red";
        ctx.fillText(winStatus ? "YOU WIN!" : "GAME OVER", cwidth / 2, cheight / 2);
    } else if (gamestate) {
        ctx.fillText(myTurn ? "Your Turn!" : "Opponent's Turn...", cwidth / 2, cheight * 0.1);
    }

    for(let i=0; i<arrows.length; i++) {
        let a = arrows[i];
        a.vy += gravity;
        a.x += a.vx;
        a.y += a.vy;
        
        drawArrow(a, false);
        
        let oppHeadX = cwidth * 0.8;
        let oppHeadY = cheight * 0.8 - 150;
        let distanceToHead = Math.hypot(a.x - oppHeadX, a.y - oppHeadY);
        let distanceToBody = Math.hypot(a.x - oppHeadX, a.y - (cheight * 0.8 - 80));
        
        if (distanceToHead <= 30 || distanceToBody <= 40) {
            socket.send(JSON.stringify(['hit', player, 20]));
            arrows.splice(i, 1);
            i--;
        } 
        else if (a.y > cheight || a.x > cwidth) {
            arrows.splice(i, 1);
            i--;
        }
    }

    for(let i=0; i<opponentArrows.length; i++) {
        let a = opponentArrows[i];
        a.vy += gravity;
        a.x += a.vx; 
        a.y += a.vy;
        
        drawArrow(a, true);
        
        if (a.y > cheight || a.x < 0) {
            opponentArrows.splice(i, 1);
            i--;
        }
    }

    requestAnimationFrame(setup); 
} 
setup();