let game = {}; //player:[health,score,opponent,playing or no,client]

const WebSocket = require('ws');
let playercount=1;

const wss = new WebSocket.Server({ port: 8080 });


wss.on('connection', function connection(ws) {

    console.log('Client connected');
    game[`player${playercount}`] = [100,0,"",0,ws];
    ws.send(`player${playercount}`);
    playercount+=1;

    ws.on('message', function incoming(message) {
        message=JSON.parse(message);
        if (message[0]==="findplayer"){
            player=message[1];
            for(let i=1;i<=Object.keys(game).length;i++){
                if(!(game[`player${i}`][2]) && `player${i}`!=player && !(game[player][3])){
                    let arr1=[game[`${player}`][0],game[`${player}`][1],`player${i}`,1,game[`${player}`][4]];
                    let arr2=[game[`player${i}`][0],game[`player${i}`][1],`${player}`,1,game[`player${i}`][4]];
                    game[`${player}`] = arr1;
                    game[`player${i}`] = arr2;
                    ws.send("connected");
                    console.log(game);
                    let client=(game[`player${i}`])[4];
                    console.log(client);
                    (client).send("connected");
                    break;
                }
            }
        }

    });

    console.log(game);

    ws.on('close', function () {
        console.log('Client disconnected');
        playercount-=1;
    });


});