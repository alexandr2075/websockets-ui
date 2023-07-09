import { httpServer } from "./src/http_server/index.js";
import { WebSocketServer } from 'ws';
import { dataGame } from "./back/store.js";
import { messageHandler } from "./back/messageHandler.js";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: 3000 });


wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', (req) => {
    const {type, data} = JSON.parse(req)
    // printValues(data);

console.log(req.toString());
    switch (type) {
      case 'reg':
        const parseData = JSON.parse(data)
        console.log(parseData);
        const player = {
          id: Date.now(),
          login: parseData.name,
          password: parseData.password,
        }
        dataGame.players.push(player);
        console.log(dataGame.players);
        ws.send(JSON.stringify({
          type:"reg",
          data:JSON.stringify({
            name: data.name,
            index:1,
            error: false,
            errorText: "errTxt"
          }),
          id:0
        }));
        break;

      case 'create_room':
        console.log('croom');
        ws.send(JSON.stringify({"type":"update_room","data":"[{\"roomId\":1,\"roomUsers\":[{\"name\":\"User 1\",\"index\":0}]}]","id":0}));
        break;
        case 'add_user_to_room':
          console.log('addpl');
          ws.send(JSON.stringify({"type":"add_player_to_room","data":"{\"indexRoom\":1}]}","id":0}));

          break;
      default:
        break;
    }
   
})
  

 
});

