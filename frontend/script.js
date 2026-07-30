let player = "";
const socket = new WebSocket('ws://localhost:8080');
let gamestate = false;
socket.onopen = function (event) {
    alert('You are Connected to WebSocket Server');
};

socket.addEventListener("message", (event) => {
    if(event.data.startsWith("player")){
        player=event.data;
        console.log(`${player}`);
    }
    if(event.data == "connected"){
        console.log("connected");
        gamestate=true;
    }

});

document.getElementById('findplayer').addEventListener("click", function() {
    console.log("Finding player");
    socket.send(JSON.stringify(['findplayer',`${player}`]));
    console.log("message sent");
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

function setup(){
    ctx.reset();
    ctx.beginPath();
    ctx.arc(cwidth*0.2, cheight*0.8-150, 35, 0, 2 * Math.PI);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cwidth*0.8, cheight*0.8-150, 35, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.stroke();
    px=cwidth*0.2;
    py=cheight*0.8-150;
    ctx.fillStyle = "brown";
    ctx.fillRect(0, cheight*0.8, cwidth, cheight*0.8);
    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.fillRect(cwidth*0.2-35,cheight*0.8-150+(35),cwidth*0.2-105,cheight*0.8-400);//cwidth*0.2 - (35), cheight*0.8, cwidth*0.2-3*35-35/2, cheight*0.8-150);
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.fillRect(cwidth*0.8-35,cheight*0.8-150+(35),cwidth*0.8-670,cheight*0.8-400);
    hitbox = [];

    angle = Math.atan2(mouseY - py, mouseX - px);
    ctx.beginPath();       
    ctx.moveTo(px, py);    
    ctx.lineTo(px + 150*Math.cos(angle),py + 150*Math.sin(angle));  
    ctx.stroke();      

    requestAnimationFrame(setup);
}
setup();