const input = document.getElementById('input') as HTMLInputElement;
const messages = document.getElementById('messages') as HTMLUListElement;
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

ws.onmessage = (event) => {
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
    name.textContent = 'bob'; // Replace with dynamic name if needed

    const time = document.createElement('div');
    time.className = 'time';

    const now = new Date();
    time.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    above.appendChild(name);
    above.appendChild(time);

    // Create and append the text container
    const text = document.createElement('div');
    text.className = 'text';
    text.textContent = event.data; // The message text

    message.appendChild(above);
    message.appendChild(text);

    // Append the message to the messageBox
    messageBox.appendChild(message);

    // Append the messageBox to the parent element in your document
    // Replace 'messages' with the actual parent element's ID or reference
    messages.appendChild(messageBox);
};


document.getElementById('form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.value) {
        console.log('sending: ', input.value)
        ws.send(input.value);
        input.value = '';
    }
});
