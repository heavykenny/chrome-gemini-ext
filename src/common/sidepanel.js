let currentChatId = null;
let session = null;
let asking = false;

document.addEventListener('DOMContentLoaded', initializeSidePanel);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "summarizeText") {
        const questionElement = document.getElementById('ask-question');
        questionElement.value = `Summarize: ${request.text}`;
        ask();
    }
});

async function initializeSidePanel() {
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

        chrome.storage.local.get(['currentChatId'], (result) => {
            currentChatId = result.currentChatId;
            if (!currentChatId) {
                createNewChat();
            } else {
                loadChat(currentChatId);
            }
            updateChatHistory();
        });
    } catch (err) {
        console.error(err);
        setError(err.message);
    }
}

function createNewChat() {
    currentChatId = 'chat_' + Date.now();
    chrome.storage.local.set({ currentChatId }, () => {
        document.getElementById("chat-container").innerHTML = '';
        document.getElementById("ask-question").value = '';
        updateChatHistory();
    });
}

function updateChatHistory() {
    const historyContainer = document.getElementById("chat-history");
    historyContainer.innerHTML = '';

    chrome.storage.local.get(null, (items) => {
        Object.keys(items).forEach(key => {
            if (key.startsWith('chat_')) {
                const chat = items[key];
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

        document.querySelectorAll('.delete-chat').forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteChat(event.target.closest('button').getAttribute('data-chat-id'));
            });
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

function addMessageToChat(sender, message) {
    const chatContainer = document.getElementById("chat-container");
    chatContainer.appendChild(createChatMessage(sender, message));
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Save to local storage
    chrome.storage.local.get([currentChatId], (result) => {
        const chat = result[currentChatId] || [];
        chat.push({ sender, message });
        chrome.storage.local.set({ [currentChatId]: chat }, updateChatHistory);
    });
}

function loadChat(chatId) {
    currentChatId = chatId;
    const chatContainer = document.getElementById("chat-container");
    chatContainer.innerHTML = '';
    chrome.storage.local.get([chatId], (result) => {
        const chat = result[chatId] || [];
        chat.forEach(msg => chatContainer.appendChild(createChatMessage(msg.sender, msg.message)));
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });
}

function deleteChat(chatId) {
    chrome.storage.local.remove(chatId, () => {
        updateChatHistory();
        if (currentChatId === chatId) {
            createNewChat();
        }
    });
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
        const stream = await session.promptStreaming(prompt);

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
        chrome.storage.local.get([currentChatId], (result) => {
            const chat = result[currentChatId] || [];
            chat.push({ sender: 'ai', message: fullResponse });
            chrome.storage.local.set({ [currentChatId]: chat }, updateChatHistory);
        });

    } catch (err) {
        setError(err.message);
    } finally {
        asking = false;
        document.getElementById('ask-button').disabled = false;
    }
}
