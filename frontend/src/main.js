"use strict";
var _a;
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const ws = new WebSocket('ws://localhost:3000');
const users = document.querySelector('.onlineUsers');
const usernameTopRight = document.querySelector('.nameBig');
const idTopRight = document.querySelector('.idBig');
const pfpTopRight = document.querySelector('.bigPfp');
ws.onopen = () => {
    console.log('Connected to server');
};
ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
    alert('Failed to connect to server');
};
ws.onmessage = (event) => {
    var _a, _b, _c, _d;
    const data = JSON.parse(event.data);
    if (data.type === 'joined') {
        usernameTopRight.textContent = data.username;
        idTopRight.textContent = data.userId;
        pfpTopRight.src = data.profilePic;
    }
    else if (data.type === 'playersList') {
        // Clear the list
        users.innerHTML = '';
        console.log(typeof (data.players));
        // Create a new list item for each player
        if (data.players.length == 1) {
            const userlistBox = document.createElement('div');
            userlistBox.className = 'nobodyOnline';
            userlistBox.textContent = 'No other users online';
            (_a = document.querySelector(".onlineUsers")) === null || _a === void 0 ? void 0 : _a.appendChild(userlistBox);
            return;
        }
        for (const player of data.players) {
            // if is current user, skip
            if (player.id === idTopRight.textContent) {
                console.log('gwea');
                continue;
            }
            const userlistBox = document.createElement('div');
            userlistBox.className = 'userlistBox';
            const pfpSide = document.createElement('img');
            pfpSide.className = 'pfpSide';
            pfpSide.src = player.profilePic;
            const rightSideList = document.createElement('div');
            rightSideList.className = 'rightSideList';
            const nameSide = document.createElement('div');
            nameSide.className = 'nameSide';
            nameSide.textContent = player.username;
            const idSide = document.createElement('div');
            idSide.className = 'idSide';
            idSide.textContent = player.id;
            rightSideList.appendChild(nameSide);
            rightSideList.appendChild(idSide);
            userlistBox.appendChild(pfpSide);
            userlistBox.appendChild(rightSideList);
            (_b = document.querySelector(".onlineUsers")) === null || _b === void 0 ? void 0 : _b.appendChild(userlistBox);
        }
    }
    else if (data.type === 'message') {
        // if data.userId == #ID from the last messageBox
        const lastMessage = messages.lastElementChild;
        let lastMessageID = 'X';
        if (lastMessage)
            lastMessageID = ((_c = lastMessage.querySelector('.ID')) === null || _c === void 0 ? void 0 : _c.textContent) || "X";
        if (lastMessageID == data.userId) {
            // append data.text as a new <div class="text"> to the last messageBox
            const text = document.createElement('div');
            text.classList.add('text');
            text.textContent = data.text;
            (_d = lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.querySelector('.message')) === null || _d === void 0 ? void 0 : _d.appendChild(text);
        }
        else {
            // Create the main messageBox div
            const messageBox = document.createElement('div');
            messageBox.className = 'messageBox';
            // Create and append the profile picture
            const pfp = document.createElement('img');
            pfp.className = 'pfp';
            pfp.src = data.profilePic;
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
    }
};
(_a = document.getElementById('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.value) {
        // console.log('sending: ', input.value)
        // ws.send(input.value);
        const message = {
            type: 'chat',
            text: input.value
        };
        ws.send(JSON.stringify(message));
        input.value = '';
    }
});
const funnyImage = document.querySelector('.funnyImage');
const images = ["jerma", "overwatch", "spies", "house", "truefake", "levels2"];
let i = Math.floor(Math.random() * images.length);
funnyImage.src = `images/ads/${images[i]}.gif`;
setInterval(() => {
    i += 1;
    if (i >= images.length)
        i = 0;
    funnyImage.src = `./images/ads/${images[i]}.gif`;
}, 90000);
usernameTopRight.addEventListener('click', () => {
    usernameTopRight.contentEditable = 'true';
    usernameTopRight.focus();
});
usernameTopRight.addEventListener('blur', () => {
    // This code runs when the user clicks away from the element
    const updatedUsername = usernameTopRight.innerText;
    const updateMessage = {
        type: 'usernameUpdate',
        newUsername: updatedUsername
    };
    ws.send(JSON.stringify(updateMessage));
});
