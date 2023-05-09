const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

app.use(express.static("public"));

const io = new Server(httpServer, {});

var users = [];
var points = new Array();
var time1 = 20;
var time2 = 10;

var preguntes;
var pregBio = require('./public/biologia.json');
var quest = -1;

var loop;

io.on("connection", (socket) => {
    
    console.log('Connectat un client.')
    
    io.emit("users", users);
    
    socket.on("nickname", function (data) {
        
        if (data == "admin") {
            socket.emit("admin", true);
        } else {
            users.push(data);
            io.emit("users", users);
        }
        
    });
    
    socket.on("score", (data) => {
        for (let index = 0; index < points.length; index++) {
            if (points[index].nom == data.name) {
                points[index].punts += parseInt(data.points);
            }  
        }
    });
    
    socket.on("register", (data) => {
        preguntes = require('./public/'+data+'.json');
        loop = setInterval(updateTimers, 1000);
    });
    
    socket.on("restart", (data) => {
        clearInterval(loop);
        users  = [];
        points = [];
        time1 = 20;
        time2 = 10;
        quest = -1;
        io.emit("reestablish", true);
    });
    
});

function updateTimers() {
    if (time1 > 0) {
        points = [];
        for (var i = 0; i < users.length; i++) {
            points.push({ "nom": users[i], "punts": 0 });
        }
        time1--;
        io.sockets.emit('time1', time1);
    } else {
        io.emit("start", true);
        if (quest == -1) {
            quest++;
            points.sort((a, b) => {
                return b.punts +- a.punts;
            });
            io.sockets.emit('points', points);
            io.sockets.emit('pregunta', preguntes[quest]);
        } else if (time2 > 0) {
            time2--;
            io.sockets.emit('time2', time2);
        } else if(time2 == 0 && quest < (preguntes.length-1)) {
            time2 = 10;
            quest++;
            points.sort((a, b) => {
                return b.punts +- a.punts;
            });
            io.sockets.emit('points', points);
            io.sockets.emit('pregunta', preguntes[quest]);
        } else if (time2 == 0 && quest == (preguntes.length-1)) {
            io.sockets.emit('points', points);
            io.emit("end", true);
        }
    }
}

httpServer.listen(3000, () =>
console.log(`Server listening at http://localhost:3000`)
);
