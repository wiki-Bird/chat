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
// store the message with: userId, username, profilePic, text, timestamp
const messages: Map<string, string> = new Map();

wss.on('connection', (ws: WebSocket) => {
    const userId = Math.random().toString(36).substr(2, 9); // Generate a random user ID
    // Initialize user data - you could allow clients to set their username and profile picture
    const pfps = [
        "https://i.pinimg.com/originals/ff/47/19/ff47193f3e789f2cfdd762d3ada525c3.jpg",
        "https://www.guiltygear.com/ggst/en/wordpress/wp-content/uploads/2021/03/anji-306x305.jpg",
        "https://i.pinimg.com/736x/2c/66/63/2c6663782d20813745a62d1fdcaa1727.jpg",
        "https://pbs.twimg.com/profile_images/460505300236505088/-Ab6NFbL.jpeg",
        "http://orig01.deviantart.net/88e0/f/2015/054/6/7/az_minecraft__profile_pic_by_jgfx_by_jinbcraft-d8j7a4w.jpg"
    ]

    const newUser: User = { ws, id: userId, username: userId, profilePic: pfps[Math.floor(Math.random() * pfps.length)] };
    users.set(userId, newUser);

    console.log('Client connected with ID:', userId);



    // broadcast to the new user their Username, ID, and Profile Picture
    ws.send(JSON.stringify({
        type: 'joined',
        userId: newUser.id,
        username: newUser.username,
        profilePic: newUser.profilePic
    }));

    // send the new user a message event for each message in messages
    messages.forEach(message => {
        ws.send(message);
    });

    broadcastPlayersList(); // Broadcast the updated list to all clients

    ws.on('message', (message: string) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'chat') {
            const sender = users.get(userId);
            if (sender) {
                const receivedMessage = parsedMessage.text.toString();
                const messageId = Math.random().toString(36).substr(2, 9); // Generate a random message ID
                const stringMessage = JSON.stringify({
                    type: 'message',
                    userId: sender.id,
                    username: sender.username,
                    profilePic: sender.profilePic,
                    text: receivedMessage,
                    timestamp: new Date().toISOString()
                });

                // save the message to the server, if there are >300, delete the oldest
                messages.set(messageId, stringMessage);
                if (messages.size > 300) {
                    const oldestMessage = messages.keys().next().value;
                    messages.delete(oldestMessage);
                }

                // Broadcast the message to all clients
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(stringMessage);
                    }
                });
            }
        }
        else if (parsedMessage.type === 'usernameUpdate') {
            const sender = users.get(userId);
            if (sender) {
                sender.username = parsedMessage.newUsername;
                users.set(userId, sender);
                broadcastPlayersList(); // Broadcast the updated list to all clients
            }
        }
    });

    ws.on('close', () => {
        users.delete(userId);
        console.log(`Client with ID ${userId} disconnected`);
        broadcastPlayersList(); // Broadcast the updated list to all clients
    });
});


server.listen(3000, () => {
    console.log(`Server started on port 3000`);
});

function broadcastPlayersList() {
    // const playersList = JSON.stringify(users);
    const playersArray = Array.from(users.values()).map(player => {
        return {
            id: player.id,  // Assuming 'id' is a property of your player object
            username: player.username,  // Assuming 'username' is a property
            profilePic: player.profilePic  // Assuming 'profilePic' is a property
        };
    });

    const playersList = JSON.stringify(playersArray);

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'playersList',
                players: playersArray
            }));
        }
    }
    );
}
