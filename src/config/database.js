const mysql = require('mysql2')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'discord_rest_api'
})

// TEST DB CONNECTION (SAFE)
pool.promise()
    .query('SELECT 1')
    .then(() => console.log('✅ DB CONNECTED'))
    .catch(err => console.error('❌ DB ERROR:', err))

module.exports = pool.promise()
