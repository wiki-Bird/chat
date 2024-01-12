import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

interface User {
    ws: WebSocket;
    id: string;
    username: string;
    profilePic: string;
}

const users: Map<string, User> = new Map();


// wss.on('connection', (ws: WebSocket) => {
//     console.log('Client connected');

//     // MESSAGE RECIEVED FROM CLIENT
//     ws.on('message', (message: string) => {
//         let receivedMessage = message.toString(); // Convert from buffer to string
//         console.log('Client messaged: ', receivedMessage)

//         wss.clients.forEach(client => {
//             if (client.readyState === WebSocket.OPEN) { //client !== ws && 
//                 client.send(receivedMessage);
//                 console.log(receivedMessage);
//             }
//         });
//     });
// });
wss.on('connection', (ws: WebSocket) => {
    const userId = Math.random().toString(36).substr(2, 9); // Generate a random user ID
    // Initialize user data - you could allow clients to set their username and profile picture
    const newUser: User = { ws, id: userId, username: 'Anonymous', profilePic: 'https://i.pinimg.com/originals/ff/47/19/ff47193f3e789f2cfdd762d3ada525c3.jpg' };
    users.set(userId, newUser);

    console.log('Client connected with ID:', userId);

    ws.on('message', (message: string) => {
        const sender = users.get(userId);
        if (sender) {
            const receivedMessage = message.toString();
            // Broadcast the message to all clients
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        userId: sender.id,
                        username: sender.username,
                        profilePic: sender.profilePic,
                        text: receivedMessage,
                        timestamp: new Date().toISOString()
                    }));
                }
            });
        }
    });

    ws.on('close', () => {
        users.delete(userId);
        console.log(`Client with ID ${userId} disconnected`);
    });
});


server.listen(3000, () => {
    console.log(`Server started on port 3000`);
});
