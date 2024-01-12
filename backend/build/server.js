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
wss.on('connection', (ws) => {
    const userId = Math.random().toString(36).substr(2, 9); // Generate a random user ID
    // Initialize user data - you could allow clients to set their username and profile picture
    const newUser = { ws, id: userId, username: 'Anonymous', profilePic: 'https://i.pinimg.com/originals/ff/47/19/ff47193f3e789f2cfdd762d3ada525c3.jpg' };
    users.set(userId, newUser);
    console.log('Client connected with ID:', userId);
    ws.on('message', (message) => {
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
