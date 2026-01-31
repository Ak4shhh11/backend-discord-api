require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()

const externalRoute = require('./routes/external.route')

// 🔥 PENTING: middleware dulu
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json())

// 🔥 routes
app.use('/api/auth', require('./routes/auth.route'))
app.use('/api/servers', require('./routes/server.route'))
app.use('/api/servers', require('./routes/channel.route'))
app.use('/api/messages', require('./routes/message.route'))
app.use('/api/dm', require('./routes/dm.route'))
app.use('/api/external', externalRoute)

module.exports = app
