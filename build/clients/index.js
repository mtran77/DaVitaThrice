// @ts-nocheck

const EmployeeSelectorBtn = document.querySelector('#Employee-selector')
const DaVitaGPTSelectorBtn = document.querySelector('#DaVitaGPT-selector')
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

// const updateMessageSender = (name) => {
//   messageSender = name
//   chatHeader.innerText = `${messageSender} chatting...`
//   chatInput.placeholder = `Type here, ${messageSender}...`

//   if (name === 'Employee') {
//     EmployeeSelectorBtn.classList.add('active-person')
//     DaVitaGPTSelectorBtn.classList.remove('active-person')
//   }
//   if (name === 'DaVitaGPT') {
//     DaVitaGPTSelectorBtn.classList.add('active-person')
//     EmployeeSelectorBtn.classList.remove('active-person')
//   }

//   /* auto-focus the input field */
//   chatInput.focus()
// }

// EmployeeSelectorBtn.onclick = () => updateMessageSender('Employee')
// DaVitaGPTSelectorBtn.onclick = () => updateMessageSender('DaVitaGPT')

const sendMessage = (e) => {
    // queryAnswer = getResponse(userQuery);

  e.preventDefault()

  const timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  
  const message = {
    sender: messageSender,
    text: chatInput.value,
    timestamp,
  }

  /* Save message to local storage */
  messages.push(message)
  localStorage.setItem('messages', JSON.stringify(messages))

  /* Add message to DOM */
  chatMessages.innerHTML += createChatMessageElement(message)

  /* Clear input field */
  chatInputForm.reset()

  /*  Scroll to bottom of chat messages */
  chatMessages.scrollTop = chatMessages.scrollHeight
}

chatInputForm.addEventListener('submit', sendMessage)

clearChatBtn.addEventListener('click', () => {
  localStorage.clear()
  chatMessages.innerHTML = ''
})