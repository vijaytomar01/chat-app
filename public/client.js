// Initialize socket connection
const socket = io();

// DOM elements
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages');
const usersList = document.getElementById('users-list');
const usernameDisplay = document.getElementById('username');
const logoutBtn = document.getElementById('logout-btn');

// State variables
let currentUsername = '';
let typingTimer;
let isTyping = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    showLoginModal();
    setupEventListeners();
});

// Show login modal
function showLoginModal() {
    loginModal.style.display = 'flex';
    usernameInput.focus();
}

// Hide login modal
function hideLoginModal() {
    loginModal.style.display = 'none';
}

// Setup event listeners
function setupEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Message form submission
    messageForm.addEventListener('submit', handleMessageSend);
    
    // Typing indicators
    messageInput.addEventListener('input', handleTyping);
    messageInput.addEventListener('keydown', handleTypingStop);
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Socket event listeners
    setupSocketListeners();
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    
    if (username.length >= 2 && username.length <= 20) {
        currentUsername = username;
        usernameDisplay.textContent = username;
        socket.emit('join', username);
        hideLoginModal();
        messageInput.focus();
    } else {
        alert('Username must be between 2 and 20 characters long.');
    }
}

// Handle message sending
function handleMessageSend(e) {
    e.preventDefault();
    const message = messageInput.value.trim();
    
    if (message && currentUsername) {
        socket.emit('message', { message });
        messageInput.value = '';
        
        // Stop typing indicator
        if (isTyping) {
            socket.emit('typing', { isTyping: false });
            isTyping = false;
        }
    }
}

// Handle typing indicators
function handleTyping() {
    if (!isTyping && currentUsername) {
        isTyping = true;
        socket.emit('typing', { isTyping: true });
    }
    
    // Clear existing timer
    clearTimeout(typingTimer);
    
    // Set timer to stop typing indicator
    typingTimer = setTimeout(() => {
        if (isTyping) {
            socket.emit('typing', { isTyping: false });
            isTyping = false;
        }
    }, 2000);
}

// Handle typing stop (on Enter key)
function handleTypingStop(e) {
    if (e.key === 'Enter' && isTyping) {
        socket.emit('typing', { isTyping: false });
        isTyping = false;
        clearTimeout(typingTimer);
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to leave the chat?')) {
        currentUsername = '';
        socket.disconnect();
        location.reload();
    }
}

// Setup socket event listeners
function setupSocketListeners() {
    // Handle incoming messages
    socket.on('message', (data) => {
        displayMessage(data);
        scrollToBottom();
    });
    
    // Handle user joined
    socket.on('user-joined', (data) => {
        displaySystemMessage(data.message);
        scrollToBottom();
    });
    
    // Handle user left
    socket.on('user-left', (data) => {
        displaySystemMessage(data.message);
        scrollToBottom();
    });
    
    // Handle users list update
    socket.on('users-list', (users) => {
        updateUsersList(users);
    });
    
    // Handle typing indicators
    socket.on('user-typing', (data) => {
        handleTypingIndicator(data);
    });
    
    // Handle connection events
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        displaySystemMessage('Connection lost. Please refresh the page.');
    });
    
    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        displaySystemMessage('Connection error. Please check your internet connection.');
    });
}

// Display a message
function displayMessage(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    // Add 'own' class if it's the current user's message
    if (data.username === currentUsername) {
        messageDiv.classList.add('own');
    }
    
    const timestamp = formatTimestamp(data.timestamp);
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="username">${escapeHtml(data.username)}</span>
            <span class="timestamp">${timestamp}</span>
        </div>
        <div class="message-content">${escapeHtml(data.message)}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
}

// Display system message
function displaySystemMessage(message) {
    const systemDiv = document.createElement('div');
    systemDiv.className = 'system-message';
    systemDiv.textContent = message;
    messagesContainer.appendChild(systemDiv);
}

// Update users list
function updateUsersList(users) {
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.username;
        
        // Highlight current user
        if (user.username === currentUsername) {
            li.style.fontWeight = 'bold';
            li.style.backgroundColor = '#e3f2fd';
        }
        
        usersList.appendChild(li);
    });
}

// Handle typing indicator display
function handleTypingIndicator(data) {
    const existingIndicator = document.querySelector(`[data-user="${data.username}"]`);
    
    if (data.isTyping) {
        if (!existingIndicator) {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing-indicator';
            typingDiv.setAttribute('data-user', data.username);
            typingDiv.textContent = `${data.username} is typing...`;
            messagesContainer.appendChild(typingDiv);
            scrollToBottom();
        }
    } else {
        if (existingIndicator) {
            existingIndicator.remove();
        }
    }
}

// Utility functions
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Auto-focus message input when clicking anywhere in the chat area
document.addEventListener('click', (e) => {
    if (!loginModal.style.display || loginModal.style.display === 'none') {
        if (e.target !== messageInput && !e.target.closest('.message-form')) {
            messageInput.focus();
        }
    }
});

// Handle Enter key in username input
usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        loginForm.dispatchEvent(new Event('submit'));
    }
});

// Handle window beforeunload
window.addEventListener('beforeunload', () => {
    if (currentUsername) {
        socket.emit('typing', { isTyping: false });
    }
});