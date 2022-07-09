const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave,getRoomUsers} = require('./utils/users')

const port = 3001
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const botName = 'Chat Bot'

// set static folder
app.use(express.static(path.join(__dirname, 'public')))

// log when client connect
io.on('connection', socket => {
  // socket for server
  // socket.broadcast for everyone but server and that only user
  // io.emit for everyone
  console.log('New WS connection')

  // list for chat message
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id)

    io.to(user.room).emit('message', formatMessage(user.username, msg))
  })

  // Runs when clients disconnect
  socket.on('disconnect', () => {
    user = userLeave(socket.id)
    if (user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  })

  socket.on('joinRoom', (msg) => {
    const user = userJoin(socket.id, msg.username, msg.room)
    socket.join(user.room)

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'))

    // Broadcast when a user connects
    socket.broadcast.to(user.room).emit('message',
      formatMessage(botName, `${msg.username} has joined the chat`))

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  })
})

server.listen(process.env.PORT || port, () => {
  console.log(`Sever running on ${port} `)
})
