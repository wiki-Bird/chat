const input = document.getElementById('input') as HTMLInputElement;
const messages = document.getElementById('messages') as HTMLUListElement;
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
    console.log('Connected to server');
};

ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
};

ws.onmessage = (event) => {
    const message = document.createElement('li');
    message.textContent = event.data;
    messages.appendChild(message);
};

document.getElementById('form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.value) {
        console.log('sending: ', input.value)
        ws.send(input.value);
        input.value = '';
    }
});
