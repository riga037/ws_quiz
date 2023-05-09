const socket = io();

const nick = document.getElementById("nick");
const nicknameInput = document.getElementById("nicknameInput");
const sendButton = document.getElementById("sendButton");
sendButton.addEventListener("click", send);
const validation = document.getElementById("validation");
const waiting = document.getElementById("waiting");
const timer1 = document.getElementById("timer1");
const players = document.getElementById("players");
const game = document.getElementById("game");
const timer2 = document.getElementById("timer2");
const pregunta = document.getElementById("pregunta");
const result = document.getElementById('result');
const ranking = document.getElementById('ranking');
const list = document.getElementById('top');
const adminpanel = document.getElementById('adminpanel');
const tema = document.getElementById('tema');
const setPreguntes = document.getElementById('setPreguntes');
const startgame = document.getElementById('startgame');
const closegame = document.getElementById('closegame');
startgame.addEventListener("click", gamestart);
closegame.addEventListener("click", gameclose);

var users = [];
var ended = false;
var winner;
var admin = false;

function send() {
    
    if(!users.includes(nicknameInput.value)) {
        nick.style.display = "none";
        waiting.style.display = "block";
        socket.emit("nickname", nicknameInput.value);
    } else {
        validation.innerHTML = "Ja existeix un jugador amb aquest nom.";
    }
    
}

function gamestart() {
    
    socket.emit("register", setPreguntes.value);
    tema.style.display = "none";
    startgame.style.display = "none";
    closegame.style.display = "inline";

}

function gameclose() {
    
    socket.emit("restart", true);
    tema.style.display = "block";
    startgame.style.display = "inline";
    closegame.style.display = "none";

}

socket.on('admin', (data) => {
    admin = data;
    if (data) {
        nick.style.display = "none";
        adminpanel.style.display = "block";
    }
});

socket.on('users', (data) => {
    users = data;
    players.innerHTML = "";
    for (var i = 0; i < users.length; i++) {
        players.innerHTML += "<span>"+users[i]+"</span>";
    }
});

socket.on('time1', (data) => {
    timer1.innerHTML = data;
});

socket.on('time2', (data) => {
    timer2.innerHTML = data;
});

socket.on('start', (data) => {
    if(data){
        if (ended) {
            nick.style.display= "none";
            waiting.style.display = "none";
            game.style.display = "none";
            document.getElementById('winner').innerText = winner;
            result.style.display = "block";
            ranking.style.display = "block";
        } else {
            nick.style.display= "none";
            waiting.style.display = "none";
            game.style.display = "block";
            ranking.style.display = "block";
        }
    }
});

socket.on('points', (data) => {
    list.innerHTML = "";
    var index = 0;
    data.forEach(function(player){
        if(index<5){
            if (index == 0) {
                winner = player.nom;
            }
            list.innerHTML += '<li>'+player.nom+' - '+player.punts+'</li>';
            index++;
        }
    });
});

socket.on('pregunta', (data) => {
    pregunta.innerHTML = data.pregunta;
    const answerButtons = document.querySelectorAll(".box");
    let active = false;
    answerButtons.forEach((button, i) => {
        button.classList.remove('correct', 'incorrect');
        button.innerHTML = data.respostes[i];
        button.addEventListener('click', function handleClick() {
            if (!active) {
                active = true;
                if (i === data.respostaCorrecta) {
                    button.classList.add('correct');
                    const score = 15 + parseInt(timer2.innerHTML);
                    socket.emit('score', { name: nicknameInput.value, points: score });
                } else {
                    button.classList.add('incorrect');
                    answerButtons[data.respostaCorrecta].classList.add('correct');
                }
                answerButtons.forEach((btn, j) => {
                    if (i !== j) {
                        btn.removeEventListener('click', handleClick);
                    }
                });
            }
        });
    });
});

socket.on('end', (data) => {
    ended = data;
});

socket.on('reestablish', (data) => {
    ended = false;
    users = [];
    players.innerHTML = "";
    if (!admin) {
        nick.style.display= "block";
        waiting.style.display = "none";
    } else {
        waiting.style.display = "block";
    }
    game.style.display = "none";
    result.style.display = "none";
    ranking.style.display = "none";
    timer1.innerHTML = 20;
});

