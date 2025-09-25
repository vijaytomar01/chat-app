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
let messagePollingInterval;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    showLoginModal();
    setupEventListeners();
    loadMessages();
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
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    
    if (username.length >= 2 && username.length <= 20) {
        try {
            const response = await fetch('/api/users/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });
            
            if (response.ok) {
                currentUsername = username;
                usernameDisplay.textContent = username;
                hideLoginModal();
                messageInput.focus();
                startMessagePolling();
                displaySystemMessage(`${username} joined the chat`);
            } else {
                alert('Failed to join chat. Please try again.');
            }
        } catch (error) {
            console.error('Error joining chat:', error);
            alert('Failed to join chat. Please check your connection.');
        }
    } else {
        alert('Username must be between 2 and 20 characters long.');
    }
}

// Handle message sending
async function handleMessageSend(e) {
    e.preventDefault();
    const message = messageInput.value.trim();
    
    if (message && currentUsername) {
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username: currentUsername, 
                    message 
                })
            });
            
            if (response.ok) {
                messageInput.value = '';
                // Messages will be loaded by polling
                loadMessages();
            } else {
                alert('Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please check your connection.');
        }
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to leave the chat?')) {
        currentUsername = '';
        stopMessagePolling();
        location.reload();
    }
}

// Load messages from API
async function loadMessages() {
    try {
        const response = await fetch('/api/messages');
        if (response.ok) {
            const messages = await response.json();
            displayMessages(messages);
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Start polling for new messages
function startMessagePolling() {
    messagePollingInterval = setInterval(loadMessages, 2000); // Poll every 2 seconds
}

// Stop polling for messages
function stopMessagePolling() {
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
}

// Display messages
function displayMessages(messages) {
    messagesContainer.innerHTML = '';
    messages.forEach(message => {
        displayMessage(message);
    });
    scrollToBottom();
}

// Display a single message
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
    scrollToBottom();
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
    stopMessagePolling();
});