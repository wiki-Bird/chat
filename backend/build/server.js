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
    "misato": "https://i.pinimg.com/originals/ff/47/19/ff47193f3e789f2cfdd762d3ada525c3.jpg",
    "gio": "https://www.guiltygear.com/ggst/en/wordpress/wp-content/uploads/2020/09/archive_gio.jpg",
    "rei": "https://i.pinimg.com/736x/2c/66/63/2c6663782d20813745a62d1fdcaa1727.jpg",
    "manul": "https://pbs.twimg.com/profile_images/460505300236505088/-Ab6NFbL.jpeg",
    "minecraft": "http://orig01.deviantart.net/88e0/f/2015/054/6/7/az_minecraft__profile_pic_by_jgfx_by_jinbcraft-d8j7a4w.jpg",
    "1000x": "https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/1675830/19521f9ce892337a9df0b2226f60f3b6838d019c.jpg",
    "vampire": "https://decider.com/wp-content/uploads/2022/05/VAMPIRE-IN-THE-GARDEN-NETFLIX-REVIEW.jpg",
    "chiito": "https://pm1.narvii.com/6809/bb10273174b53729a8527841b405e2625c127db5v2_hq.jpg",
    // "mako":"https://i.pinimg.com/originals/2c/09/01/2c0901600aaf9e03d9bcad28452d5c80.jpg",
    "yuuri": "https://i.pinimg.com/474x/10/c5/43/10c543516e4c1a6528c90edbc7676a0c.jpg",
    "venture": "https://pbs.twimg.com/media/GLYLlkzaQAALQOa.jpg"
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
