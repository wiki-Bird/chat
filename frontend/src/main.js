"use strict";
var _a;
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => {
    console.log('Connected to server');
};
ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
};
// ws.onmessage = (event) => {
//     const message = document.createElement('li');
//     message.textContent = event.data;
//     messages.appendChild(message);
// };
// <div class="messageBox">
// <img class="pfp" src="https://i.pinimg.com/originals/ff/47/19/ff47193f3e789f2cfdd762d3ada525c3.jpg" loading="lazy">
// <div class="message">
//     <div class="above">
//         <div class="name">bob</div>
//         <div class="time">12:00</div>
//         <div class="ID">123456789</div>
//     </div>
//     <div class="text">hello there how are you</div>
// </div>
// </div>
ws.onmessage = (event) => {
    var _a, _b;
    const data = JSON.parse(event.data);
    // if data.userId == #ID from the last messageBox
    const lastMessage = messages.lastElementChild;
    console.log(lastMessage);
    let lastMessageID = 'X';
    if (lastMessage)
        lastMessageID = ((_a = lastMessage.querySelector('.ID')) === null || _a === void 0 ? void 0 : _a.textContent) || "X";
    console.log(lastMessageID, data.userId);
    if (lastMessageID == data.userId) {
        // append data.text as a new <div class="text"> to the last messageBox
        const text = document.createElement('div');
        text.classList.add('text');
        text.textContent = data.text;
        (_b = lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.querySelector('.message')) === null || _b === void 0 ? void 0 : _b.appendChild(text);
    }
    else {
        // Create the main messageBox div
        const messageBox = document.createElement('div');
        messageBox.className = 'messageBox';
        // Create and append the profile picture
        const pfp = document.createElement('img');
        pfp.className = 'pfp';
        pfp.src = 'https://i.pinimg.com/originals/ff/47/19/ff47193f3e789f2cfdd762d3ada525c3.jpg';
        pfp.loading = 'lazy';
        messageBox.appendChild(pfp);
        // Create the message container
        const message = document.createElement('div');
        message.className = 'message';
        // Create and append the 'above' container
        const above = document.createElement('div');
        above.className = 'above';
        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = data.username; // Replace with dynamic name if needed
        const time = document.createElement('div');
        time.className = 'time';
        const now = new Date();
        time.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const ID = document.createElement('div');
        ID.className = 'ID';
        ID.textContent = data.userId;
        above.appendChild(name);
        above.appendChild(time);
        above.appendChild(ID);
        // Create and append the text container
        const text = document.createElement('div');
        text.className = 'text';
        text.textContent = text.textContent = data.text; // The message text
        message.appendChild(above);
        message.appendChild(text);
        // Append the message to the messageBox
        messageBox.appendChild(message);
        // Append the messageBox to the parent element in your document
        // Replace 'messages' with the actual parent element's ID or reference
        messages.appendChild(messageBox);
    }
};
(_a = document.getElementById('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.value) {
        console.log('sending: ', input.value);
        ws.send(input.value);
        input.value = '';
    }
});
