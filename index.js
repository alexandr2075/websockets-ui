import { httpServer } from "./src/http_server/index.js";
import { WebSocketServer } from 'ws';
import { dataGame } from "./back/store.js";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: 3000 });

function broadcastMessage(message, ws) {
  wss.clients.forEach((client) => {
    if(ws.id === client.id) {
      client.send(JSON.stringify(message))
    }
  })
}

wss.on('connection', function connection(ws) {
  ws.id = Date.now();
  ws.on('error', console.error);
  ws.on('message', (req) => {
    const {type, data} = JSON.parse(req);

      switch (type) {
        case 'reg':
          const parseData = JSON.parse(data)
          const reg = {
            type:"reg",
            data:JSON.stringify({
              name: parseData.name,
              index: 0,
              error: false,
              errorText: "errTxt"
            }),
            id: 0};
          ws.send(JSON.stringify(reg));
          const room = {
            roomId: Date.now(),
            roomUsers: [
                {name: `User ${ws.id}`, index: 0}
            ]
          }
          dataGame.rooms.push(room);
          const updateRoom = {
            type:"update_room",
            data:JSON.stringify([room]),
            id: 0};
          ws.send(JSON.stringify(updateRoom));
          break;
  
        case 'create_room':
          ws.send(JSON.stringify({
            type:"update_room",
            data:JSON.stringify(dataGame.rooms[0]),
            id: 0}));
          break;

        case 'add_user_to_room':
          wss.clients.forEach((client) => {
            if(ws.id !== client.id) {
              dataGame.rooms[0].roomUsers.push({name: `User ${ws.id}`, index: 2})
            }
            client.send(JSON.stringify({
              type:"update_room",
              data:JSON.stringify(dataGame.rooms[0]),
              id: 0}))

            client.send(JSON.stringify({
              type:"create_game",
              data:JSON.stringify(
                {idGame:0,
                idPlayer: client.id
              }
            ),
              id:0}));
          })
          break;

          case 'add_ships':
            const parsData = JSON.parse(data)
            console.log(parsData);
            wss.clients.forEach((client) => {
              client.on('message', (data) => {
                const d = data.toString();
                const dUTF8 = JSON.parse(d)
                console.log(dUTF8);
                if(data) {
                  client.send(JSON.stringify({
                    type:"start_game",
                    data:JSON.stringify(
                      {ships: parsData.ships,
                      currentPlayerIndex: client.id
                    }
                  ),
                    id:0}))
      
                  client.send(JSON.stringify({
                    type:"turn",
                    data:JSON.stringify({currentPlayer: client.id}),
                    id:0}));
                }
              })
              
            })
          break;

          case 'attack':
            wss.clients.forEach((client) => {
            
              client.send(JSON.stringify({
                type:"attack",
                data:JSON.stringify({
                  position: {x: 3, y: 4},
                  currentPlayer: client.id,
                  status: "miss"
                }),
                id: 0}))
  
              client.send(JSON.stringify({
                type:"turn",
                data:JSON.stringify({currentPlayer: client.id}),
                id:0}));
            })
            break;

          case 'randomAttack':
            wss.clients.forEach((client) => {
            
              client.send(JSON.stringify({
                type:"attack",
                data:JSON.stringify({
                  position: {x: 3, y: 4},
                  currentPlayer: client.id,
                  status: "miss"
                }),
                id: 0}))
  
              client.send(JSON.stringify({
                type:"turn",
                data:JSON.stringify({currentPlayer: client.id}),
                id:0}));
            })
            break;
            
        default:
          break;
      }
  
});
 
});

