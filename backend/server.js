let game = {}; 

const WebSocket = require('ws'); 
let playercount=1; 

const wss = new WebSocket.Server({ port: 8080 }); 

wss.on('connection', function connection(ws) { 

    ws.send(`player${playercount}`); 
    game[`player${playercount}`] = [100,0,"",0,ws]; 
    playercount+=1; 

    ws.on('message', function incoming(message) { 
        let parsedMessage;
        try {
            parsedMessage=JSON.parse(message); 
        } catch(e) {
            return;
        }

        if (parsedMessage[0]==="findplayer"){ 
            let player=parsedMessage[1]; 
            for(let i=1;i<=Object.keys(game).length;i++){ 
                if(!(game[`player${i}`][2]) && `player${i}`!=player && !(game[player][3])){ 
                    let arr1=[game[`${player}`][0],game[`${player}`][1],`player${i}`,1,game[`${player}`][4]]; 
                    let arr2=[game[`player${i}`][0],game[`player${i}`][1],`${player}`,1,game[`player${i}`][4]]; 
                    game[`${player}`] = arr1; 
                    game[`player${i}`] = arr2; 
                    
                    game[`${player}`][4].send("connected"); 
                    game[`player${i}`][4].send("connected"); 
                    
                    game[`${player}`][4].send(JSON.stringify(["turn", true]));
                    game[`player${i}`][4].send(JSON.stringify(["turn", false]));
                    
                    break; 
                } 
            } 
        }
        else if (parsedMessage[0]==="shoot") {
            let sender = parsedMessage[1];
            let arrowData = parsedMessage[2];
            let opponent = game[sender][2];
            if (opponent && game[opponent]) {
                let oppClient = game[opponent][4];
                oppClient.send(JSON.stringify(["opponent_shoot", arrowData]));
                oppClient.send(JSON.stringify(["turn", true]));
            }
        }
        else if (parsedMessage[0]==="hit") {
            let sender = parsedMessage[1];
            let damage = parsedMessage[2];
            let opponent = game[sender][2];
            if (opponent && game[opponent]) {
                game[opponent][0] -= damage; 
                
                if (game[opponent][0] <= 0) game[opponent][0] = 0;
                
                let oppClient = game[opponent][4];
                let senderClient = game[sender][4];
                
                oppClient.send(JSON.stringify(["health_update", game[opponent][0], game[sender][0]]));
                senderClient.send(JSON.stringify(["health_update", game[sender][0], game[opponent][0]]));
                
                if (game[opponent][0] === 0) {
                    oppClient.send(JSON.stringify(["game_over", false]));
                    
                    game[sender][1] += 10;
                    senderClient.send(JSON.stringify(["score_update", game[sender][1]]));
                    senderClient.send(JSON.stringify(["game_over", true]));
                } else {
                    game[sender][1] += 10;
                    senderClient.send(JSON.stringify(["score_update", game[sender][1]]));
                }
            }
        }
        else if (parsedMessage[0]==="reset") {
            let sender = parsedMessage[1];
            if (game[sender]) {
                game[sender][0] = 100; // Reset health back to 100
                game[sender][2] = "";  // Clear opponent string
                game[sender][3] = 0;   // Reset playing status back to 0
            }
        }

    }); 

    ws.on('close', function () { 
        playercount-=1; 
    }); 

});