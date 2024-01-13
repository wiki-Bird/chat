const input = document.getElementById('input') as HTMLInputElement;
const messages = document.getElementById('messages') as HTMLUListElement;
const ws = new WebSocket('ws://localhost:3000');
const users = document.querySelector('.onlineUsers') as HTMLUListElement;

ws.onopen = () => {
    console.log('Connected to server');
};

ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'playersList') {
        // Clear the list
        users.innerHTML = '';
        console.log(typeof(data.players))

        // Create a new list item for each player
        for (const player of data.players) {
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
        const lastMessage = messages.lastElementChild;
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
    }
};


document.getElementById('form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.value) {
        console.log('sending: ', input.value)
        ws.send(input.value);
        input.value = '';
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
}, 10000);