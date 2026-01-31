require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()

// 🔥 PENTING: middleware dulu
app.use(cors())
app.use(express.json())

// 🔥 routes
app.use('/api/auth', require('./routes/auth.route'))
app.use('/api/servers', require('./routes/server.route'))
app.use('/api/servers', require('./routes/channel.route'))
app.use('/api/messages', require('./routes/message.route'))
app.use('/api/dm', require('./routes/dm.route'))

module.exports = app
