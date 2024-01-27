const input = document.getElementById('input') as HTMLInputElement;
const messages = document.getElementById('messages') as HTMLUListElement;
const users = document.querySelector('.onlineUsers') as HTMLUListElement;
const usernameTopRight = document.querySelector('.nameBig') as HTMLDivElement;
const idTopRight = document.querySelector('.idBig') as HTMLDivElement;
const pfpTopRight = document.querySelector('.bigPfp') as HTMLImageElement;

// const ws = new WebSocket('ws://localhost:3000');
const ws = new WebSocket('wss://chat-backend-1111.fly.dev/');

// https://chat-backend-3906.onrender.com/
//const ws = new WebSocket('wss://chat-backend-3906.onrender.com/');
// https://chat-backend-1111.fly.dev/


let firstScroll = true;

ws.onopen = () => {
    console.log('Connected to server');
};

ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
    alert('Failed to connect to server');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'joined') {
        usernameTopRight.textContent = data.username;
        idTopRight.textContent = data.userId;
        pfpTopRight.src = data.profilePic;
    }
    else if (data.type === 'playersList') {
        if (firstScroll) {
            console.log('first scroll')
            scrollToBottom();
            firstScroll = false;
        }
        // Clear the list
        users.innerHTML = '';
        console.log(typeof(data.players))

        // Create a new list item for each player
        if (data.players.length == 1) {
            const userlistBox = document.createElement('div');
            userlistBox.className = 'nobodyOnline';
            userlistBox.textContent = 'No other users online';

            document.querySelector(".onlineUsers")?.appendChild(userlistBox);
            return;
        }

        for (const player of data.players) {
            // if is current user, skip
            if (player.id === idTopRight.textContent) {
                console.log('gwea')
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

            document.querySelector(".onlineUsers")?.appendChild(userlistBox);
        }
    }
    else if (data.type === 'message') {
        // if data.userId == #ID from the last messageBox
        // const lastMessage = messages.lastElementChild;
        const lastMessage = messages.firstElementChild;
        let lastMessageID = 'X';
        if (lastMessage) lastMessageID = lastMessage.querySelector('.ID')?.textContent || "X";

        if (lastMessageID == data.userId) {
            // append data.text as a new <div class="text"> to the last messageBox
            const text = document.createElement('div');
            text.classList.add('text');
            text.textContent = data.text;
            lastMessage?.querySelector('.message')?.appendChild(text);
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
            // messages.appendChild(messageBox);

            // append it to the top of the list
            messages.prepend(messageBox);
        }
        checkScroll();
    }
    
};


document.getElementById('form')?.addEventListener('submit', (event) => {
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
        scrollToBottom();
    }
});

const funnyImage = document.querySelector('.funnyImage') as HTMLImageElement;
const images = ["jerma", "overwatch", "spies", "house", "truefake", "levels2"]
let i = Math.floor(Math.random() * images.length);
funnyImage.src = `images/ads/${images[i]}.gif`;
setInterval(() => {
    i += 1;
    if (i >= images.length) i = 0;
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


function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}

function checkScroll() {
    // check if the user is scrolled to the bottom
    if (messages.scrollTop + messages.clientHeight >= messages.scrollHeight) {
        console.log('gwaaaaa')
        scrollToBottom();
    }
}