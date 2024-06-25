let currentChatId = null;
let session = null;
let asking = false;

function createNewChat() {
    currentChatId = 'chat_' + Date.now();
    localStorage.setItem('currentChatId', currentChatId);
    document.getElementById("chat-container").innerHTML = '';
    document.getElementById("ask-question").value = '';
    updateChatHistory();
}

function updateChatHistory() {
    const historyContainer = document.getElementById("chat-history");
    historyContainer.innerHTML = '';
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('chat_')) {
            const chat = JSON.parse(localStorage.getItem(key));
            const lastMessage = chat.length > 0 ? chat[chat.length - 1].message : '';
            const chatPreview = lastMessage.substring(0, 30) + (lastMessage.length > 30 ? '...' : '');
            const chatItem = document.createElement('div');
            chatItem.className = 'flex justify-between items-center p-2 hover:bg-gray-200 cursor-pointer';
            chatItem.innerHTML = `
                <span onclick="loadChat('${key}')">${chatPreview || 'Empty chat'}</span>
                <button class="delete-chat text-red-500 hover:text-red-700" data-chat-id="${key}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            historyContainer.appendChild(chatItem);
        }
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-chat').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            deleteChat(event.target.closest('button').getAttribute('data-chat-id'));
        });
    });
}

function setError(error) {
    const errorElement = document.getElementById("nano-error");
    if (error) {
        errorElement.textContent = error;
        errorElement.classList.remove("hidden");
    } else {
        errorElement.textContent = "";
        errorElement.classList.add("hidden");
    }
}

function createChatMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `max-w-3/4 ${sender === 'user' ? 'ml-auto' : 'mr-auto'} mb-2`;
    messageDiv.innerHTML = `
        <div class="inline-block p-3 rounded-lg ${sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'} shadow">
            ${message}
        </div>
    `;
    return messageDiv;
}

// Update the addMessageToChat function to save AI messages as well
function addMessageToChat(sender, message) {
    const chatContainer = document.getElementById("chat-container");
    chatContainer.appendChild(createChatMessage(sender, message));
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Save to local storage
    const chat = JSON.parse(localStorage.getItem(currentChatId) || '[]');
    chat.push({sender, message});
    localStorage.setItem(currentChatId, JSON.stringify(chat));
    updateChatHistory();
}

function loadChat(chatId) {
    currentChatId = chatId;
    const chatContainer = document.getElementById("chat-container");
    chatContainer.innerHTML = '';
    const chat = JSON.parse(localStorage.getItem(chatId) || '[]');
    chat.forEach(msg => chatContainer.appendChild(createChatMessage(msg.sender, msg.message)));
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function deleteChat(chatId) {
    localStorage.removeItem(chatId);
    updateChatHistory();
    if (currentChatId === chatId) {
        createNewChat();
    }
}

function clearAllChats() {
    localStorage.clear();
    updateChatHistory();
    createNewChat();
}

function toggleChatHistory() {
    const historyPanel = document.getElementById("history-panel");
    historyPanel.classList.toggle("hidden");
}

async function ask() {
    if (asking) return;

    const questionElement = document.getElementById('ask-question');
    const prompt = questionElement.value.trim();
    if (!prompt) return;

    addMessageToChat('user', prompt);
    questionElement.value = '';

    try {
        asking = true;
        document.getElementById('ask-button').disabled = true;
        setError('');
        const stream = session.promptStreaming(prompt);

        // Create a new message element for the AI response
        const aiMessageElement = createChatMessage('ai', '');
        const chatContainer = document.getElementById("chat-container");
        chatContainer.appendChild(aiMessageElement);
        const aiMessageContent = aiMessageElement.querySelector('div');

        let fullResponse = '';
        for await (const chunk of stream) {
            // Only add the new part of the chunk
            const newContent = chunk.slice(fullResponse.length);
            fullResponse += newContent;

            aiMessageContent.innerHTML += newContent;

            // Scroll to the bottom of the chat container
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        // Update the message in local storage without adding a new message to the chat
        const chat = JSON.parse(localStorage.getItem(currentChatId) || '[]');
        chat.push({sender: 'ai', message: fullResponse});
        localStorage.setItem(currentChatId, JSON.stringify(chat));
        updateChatHistory();

    } catch (err) {
        setError(err.message);
    } finally {
        asking = false;
        document.getElementById('ask-button').disabled = false;
    }
}

window.addEventListener("load", async function () {
    try {
        const hasAI = window.ai != null;
        const hasNano = hasAI && (await window.ai.canCreateTextSession()) === "readily";
        if (!hasNano) {
            setError(!hasAI ? "AI not supported in this browser" : "AI not ready yet");
            document.getElementById('how-to').classList.remove('hidden');
            return;
        } else {
            document.getElementById('how-to').classList.add('hidden');
        }

        session = await window.ai.createTextSession();
        const askElement = document.getElementById('ask-button');
        const questionElement = document.getElementById('ask-question');
        const newChatButton = document.getElementById('new-chat');
        const hamburgerButton = document.getElementById('hamburger');

        askElement.addEventListener('click', ask);
        newChatButton.addEventListener('click', createNewChat);
        hamburgerButton.addEventListener('click', toggleChatHistory);

        questionElement.addEventListener('keydown', (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                ask();
            }
        });

        currentChatId = localStorage.getItem('currentChatId');
        if (!currentChatId) {
            createNewChat();
        } else {
            loadChat(currentChatId);
        }

        updateChatHistory();
        document.body.setAttribute("data-ready", "true");
    } catch (err) {
        console.error(err);
        setError(err.message);
    }
});
