require('dotenv').config()

const http = require('http')
const { Server } = require('socket.io')
const app = require('./app')

const server = http.createServer(app)

// 🔥 SOCKET.IO TETAP HIDUP
const io = new Server(server, {
  cors: { origin: "*" }
})

io.on('connection', socket => {
  console.log('User connected:', socket.id)

  socket.on('join-channel', channelId => {
    socket.join(`channel-${channelId}`)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
})

// biar bisa dipake di route
app.set('io', io)

server.listen(3000, () => {
  console.log('Server running on 3000')
})
