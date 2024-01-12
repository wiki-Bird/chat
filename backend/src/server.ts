import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    // MESSAGE RECIEVED FROM CLIENT
    ws.on('message', (message: string) => {
        let receivedMessage = message.toString(); // Convert from buffer to string
        console.log('Client messaged: ', receivedMessage)

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) { //client !== ws && 
                client.send(receivedMessage);
                console.log(receivedMessage);
            }
        });
    });
});

server.listen(3000, () => {
    console.log(`Server started on port 3000`);
});
