const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

const socket = io()

// Get username and room from userSelect: 
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

// Message from server
socket.on('message', (message) => {
  console.log(message)
  outputMessage(message)

  // ScrollDown
  chatMessages.scrollTop = chatMessages.scrollHeight
})

socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room)
  outputUsers(users)
})

// Join Chatroom
socket.emit('joinRoom', {username,room})

chatForm.addEventListener('submit', (e) => {
  e.preventDefault()
  // Get message text
  let msg = e.target.elements.msg.value

  // Emit message to server
  socket.emit('chatMessage', msg)

  // Clear input
  e.target.elements.msg.value = ''
  e.target.elements.msg.value.focus
})

// Output message to DOM
function outputMessage (message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `	<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
  document.querySelector('.chat-messages').appendChild(div)
}

// Add room name to Dom
function outputRoomName (room) {
  roomName.innerText = room
}

function outputUsers (users) {
  userList.innerHTML = `${users.map(user =>
        `<li>${user.username} </li>`).join('')}`
}
