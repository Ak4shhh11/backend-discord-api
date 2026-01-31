console.log('JWT FROM CONTROLLER:', process.env.JWT_SECRET)


const db = require('../config/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body

        // cek email sudah ada atau belum
        const [existing] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        )

        if (existing.length > 0) {
            return res.status(409).json({
                message: 'Email already registered'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await db.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        )

        res.status(201).json({
            message: 'Register success'
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: 'Server error'
        })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )

        // 🔎 DEBUG DI SINI
        console.log('JWT_SECRET:', process.env.JWT_SECRET)
        console.log('ROWS:', rows)

        if (!rows || rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const user = rows[0]

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const token = jwt.sign(

            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
)

        res.json({ token })

    } catch (error) {
        console.error('LOGIN ERROR:', error)
        res.status(500).json({ message: 'Server error' })
    }
}
