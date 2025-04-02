// index.js
import { runQuery } from './frontendApi.js';

const chatHeader = document.querySelector('.chat-header')
const chatMessages = document.querySelector('.chat-messages')
const chatInputForm = document.querySelector('.chat-input-form')
const chatInput = document.querySelector('.chat-input')
const clearChatBtn = document.querySelector('.clear-chat-button')

const messages = JSON.parse(localStorage.getItem('messages')) || []

const createChatMessageElement = (message) => `
  <div class="message ${message.sender === 'Employee' ? 'blue-bg' : 'gray-bg'}">
    <div class="message-sender">${message.sender}</div>
    <div class="message-text">${message.text}</div>
    <div class="message-timestamp">${message.timestamp}</div>
  </div>
`

window.onload = () => {
  messages.forEach((message) => {
    chatMessages.innerHTML += createChatMessageElement(message)
  })
}

let messageSender = 'Employee'

const sendMessage = async (e) => {
  e.preventDefault();

  const timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

  const message = {
    sender: messageSender,
    text: chatInput.value,
    timestamp,
  };

  messages.push(message);
  localStorage.setItem('messages', JSON.stringify(messages));
  chatMessages.innerHTML += createChatMessageElement(message);
  chatInputForm.reset();
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await runQuery(message.text);

    chatMessages.innerHTML += createChatMessageElement({
      sender: 'DaVitaGPT',
      text: response.answer,
      timestamp,
    });

    if (response.sources) {
      response.sources.forEach(src => {
        console.log(`Source: ${src.title} - ${src.url}`);
      });
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;

  } catch (error) {
    console.error('Error during query execution:', error);
  }
};

chatInputForm.addEventListener('submit', sendMessage);

clearChatBtn.addEventListener('click', () => {
  localStorage.clear()
  chatMessages.innerHTML = ''
})
