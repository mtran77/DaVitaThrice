// index.js - client side logic - handles user interactions, updates DOM and local storage of chat history
import { runQuery } from './frontendAPI.js';

const chatHeader = document.querySelector('.chat-header');
const chatMessages = document.querySelector('.chat-messages');
const chatInputForm = document.querySelector('.chat-input-form');
const chatInput = document.querySelector('.chat-input');
const clearChatBtn = document.querySelector('.clear-chat-button');

const messages = JSON.parse(localStorage.getItem('messages')) || [];

const createChatMessageElement = (message) => `
  <div class="message ${message.sender === 'Employee' ? 'blue-bg' : 'gray-bg'}">
    <div class="message-sender">${message.sender}</div>
    <div class="message-text">${message.text}</div>
    <div class="message-timestamp">${message.timestamp}</div>
  </div>
`;

function addMessage(message) {
  messages.push(message);
  localStorage.setItem('messages', JSON.stringify(messages));
  chatMessages.insertAdjacentHTML('beforeend', createChatMessageElement(message));
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.onload = () => {
  chatMessages.innerHTML = '';
  messages.forEach((message) => {
    chatMessages.insertAdjacentHTML('beforeend', createChatMessageElement(message));
  });
  // onload scroll
  chatMessages.scrollTop = chatMessages.scrollHeight;
  chatInput.value = '';
};

let messageSender = 'You';

const sendMessage = async (e) => {
  e.preventDefault();

  const timestamp = new Date().toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const userMessage = {
    sender: messageSender,
    text: chatInput.value,
    timestamp,
  };

  addMessage(userMessage);
  chatInputForm.reset();

  try {
    const response = await runQuery(userMessage.text);

    const aiMessage = {
      sender: 'DaVitaGPT',
      text: response.answer,
      timestamp,
    };

    addMessage(aiMessage);

    if (response.sources) {
      response.sources.forEach((src) => {
        console.log(`Source: ${src.title} - ${src.url}`);
      });
    }
  } catch (error) {
    console.error('Error during query execution:', error);
  }
};

chatInputForm.addEventListener('submit', sendMessage);

clearChatBtn.addEventListener('click', () => {
  localStorage.clear();
  chatMessages.innerHTML = '';
});