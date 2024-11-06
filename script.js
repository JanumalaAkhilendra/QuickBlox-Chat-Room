import { QB_CONFIG } from './utils/quickblox-config.js';
// import 'dotenv/config'; // This will load environment variables from .env file

// const QB = require('quickblox');

// Initialize QuickBlox with your app credentials
QB.init(QB_CONFIG.appId, QB_CONFIG.authKey, QB_CONFIG.authSecret);

// Elements
const loginSection = document.getElementById('loginSection');
const chatSection = document.getElementById('chatSection');
const chatMessages = document.getElementById('chatMessages');
const loginButton = document.getElementById('loginButton');
const sendButton = document.getElementById('sendButton');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const messageInput = document.getElementById('messageInput');

let currentUser, roomId = '104621_6725d1613d12314c9c3a7add@muc.chat.quickblox.com';

// User Login Function
loginButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    QB.createSession({ login: username, password: password }, (err, session) => {
        if (err) {
            console.error('Login error:', err);
            alert('Login failed');
        } else {
            currentUser = session.user_id;
            joinChatRoom(roomId);
            loginSection.style.display = 'none';
            chatSection.style.display = 'block';
        }
    });
});

// Join Chat Room Function
function joinChatRoom(roomId) {
    QB.chat.connect({ userId: currentUser, password: passwordInput.value.trim() }, (err, roster) => {
        if (err) {
            console.error('Error connecting to chat:', err);
        } else {
            console.log('Connected to chat');
            QB.chat.muc.join(roomId, (err, result) => {
                if (err) {
                    console.error('Error joining chat room:', err);
                } else {
                    console.log('Joined chat room:', result);
                    listenForMessages();
                }
            });
        }
    });
}

// Send Message Function
sendButton.addEventListener('click', () => {
    const messageText = messageInput.value.trim();
    if (messageText) {
        const message = {
            type: 'chat',
            body: messageText,
            extension: {
                save_to_history: 1,
            },
        };

        QB.chat.send(roomId, message);
        displayMessage(`You: ${messageText}`);
        messageInput.value = '';
    }
});

// Display Message in UI
function displayMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Listen for Incoming Messages
function listenForMessages() {
    QB.chat.onMessageListener = (userId, message) => {
        displayMessage(`User ${userId}: ${message.body}`);
    };
}
