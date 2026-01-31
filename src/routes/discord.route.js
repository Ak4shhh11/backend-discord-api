const express = require('express')
const app = express()

app.use(express.json())

app.use('/api/auth', require('./routes/auth.route'))
// app.use('/api/servers', require('./routes/server.route'))
// app.use('/api/discord', require('./routes/discord.route'))

module.exports = app
