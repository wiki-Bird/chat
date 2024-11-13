"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http = __importStar(require("http"));
const WebSocket = __importStar(require("ws"));
const app = (0, express_1.default)();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const users = new Map();
// store the message with: userId, username, profilePic, text, timestamp
const messages = new Map();
let userNameCount = 1;
const pfps = {
    "misato": "https://raw.githubusercontent.com/wiki-Bird/chat/refs/heads/main/images/pfps/misato.jpg",
    "gio": "https://raw.githubusercontent.com/wiki-Bird/chat/refs/heads/main/images/pfps/archive_gio.jpg",
    "rei": "https://raw.githubusercontent.com/wiki-Bird/chat/refs/heads/main/images/pfps/rei.jpg",
    "manul": "https://raw.githubusercontent.com/wiki-Bird/chat/refs/heads/main/images/pfps/manul.jpeg",
    "minecraft": "https://raw.githubusercontent.com/wiki-Bird/chat/refs/heads/main/images/pfps/minecraft2.png",
    "1000x": "https://raw.githubusercontent.com/wiki-Bird/chat/refs/heads/main/images/pfps/1000x.jpg",
    "vampire": "https://raw.githubusercontent.com/wiki-Bird/chat/refs/heads/main/images/pfps/vampire.jpg",
    "chiito": "https://raw.githubusercontent.com/wiki-Bird/chat/refs/heads/main/images/pfps/chi.png",
    // "mako":"https://raw.githubusercontent.com/wiki-Bird/chat/refs/heads/main/images/pfps/mako.jpg",
    "yuuri": "https://raw.githubusercontent.com/wiki-Bird/chat/refs/heads/main/images/pfps/yuuri.png",
    "venture": "https://raw.githubusercontent.com/wiki-Bird/chat/refs/heads/main/images/pfps/venture.webp"
};
wss.on('connection', (ws) => {
    const userId = Math.random().toString(36).substr(2, 9); // Generate a random user ID
    let tempUsername = "User " + userNameCount;
    userNameCount++;
    const rand = Math.floor(Math.random() * Object.values(pfps).length);
    const pfp = Object.values(pfps)[rand];
    const pfpTitle = Object.keys(pfps)[rand];
    const newUser = { ws, id: userId, username: tempUsername, profilePic: pfp };
    users.set(userId, newUser);
    console.log('Client connected with ID:', userId);
    // broadcast to the new user their Username, ID, and Profile Picture
    ws.send(JSON.stringify({
        type: 'joined',
        userId: newUser.id,
        username: newUser.username,
        profilePic: newUser.profilePic,
        profilePicTitle: pfpTitle,
        avatars: pfps
    }));
    // send the new user a message event for each message in messages
    messages.forEach(message => {
        ws.send(message);
    });
    broadcastPlayersList(); // Broadcast the updated list to all clients
    ws.on('message', (message) => {
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
                    if (oldestMessage !== undefined) {
                        messages.delete(oldestMessage);
                    }
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
        else if (parsedMessage.type === 'avatarUpdate') {
            const sender = users.get(userId);
            if (sender) {
                // get the avatar that corresponds to the title
                const avatarUpdated = pfps[parsedMessage.newPfp];
                sender.profilePic = avatarUpdated;
                users.set(userId, sender);
                broadcastPlayersList(); // Broadcast the updated list to all clients
                console.log(parsedMessage.newPfp);
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
// const PORT = process.env.PORT || 3000; // Fallback to 3000 if PORT is not set
// server.listen(Number(PORT), '0.0.0.0', () => {
//     console.log(`Server started on port ${PORT}`);
// });
function broadcastPlayersList() {
    // const playersList = JSON.stringify(users);
    const playersArray = Array.from(users.values()).map(player => {
        return {
            id: player.id, // Assuming 'id' is a property of your player object
            username: player.username, // Assuming 'username' is a property
            profilePic: player.profilePic // Assuming 'profilePic' is a property
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
    });
}
