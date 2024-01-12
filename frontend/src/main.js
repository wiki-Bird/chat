"use strict";
// const socket = new WebSocket('ws://localhost:3000');
var _a;
// const chatContainer = document.getElementById('chat-container') as HTMLDivElement;
// const messageInput = document.getElementById('message-input') as HTMLInputElement;
// const sendButton = document.getElementById('send-button') as HTMLButtonElement;
// sendButton.addEventListener('click', () => {
//     const message = messageInput.value;
//     socket.send(message);
//     messageInput.value = '';
// });
// socket.addEventListener('message', (event) => {
//     const message = document.createElement('p');
//     message.textContent = event.data;
//     chatContainer.appendChild(message);
// });
// --------------------------------------------------
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const ws = new WebSocket('ws://localhost:3000');
console.log('hello');
ws.onopen = () => {
    console.log('Connected to WebSocket server');
};
ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
};
ws.onmessage = (event) => {
    const message = document.createElement('li');
    message.textContent = event.data;
    messages.appendChild(message);
};
(_a = document.getElementById('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.value) {
        console.log('sending: ', input.value);
        ws.send(input.value);
        input.value = '';
    }
});
