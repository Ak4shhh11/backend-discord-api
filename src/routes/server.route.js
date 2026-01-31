const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth.middleware')
const db = require('../config/database')

/**
 * CREATE SERVER
 * POST /api/servers
 */
router.post('/', auth, async (req, res) => {
    const { name } = req.body
    const userId = req.user.id

    if (!name) {
        return res.status(400).json({ message: 'Server name required' })
    }

    try {
        // 1. Insert server
        const [result] = await db.query(
            'INSERT INTO servers (name, owner_id) VALUES (?, ?)',
            [name, userId]
        )

        const serverId = result.insertId

        // 2. Auto join owner
        await db.query(
            'INSERT INTO server_members (user_id, server_id, role) VALUES (?, ?, ?)',
            [userId, serverId, 'owner']
        )

        res.json({
            message: 'Server created',
            server_id: serverId
        })
    } catch (err) {
        console.error('CREATE SERVER ERROR:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

/**
 * JOIN SERVER
 * POST /api/servers/:id/join
 */
router.post('/:id/join', auth, async (req, res) => {
    const serverId = req.params.id
    const userId = req.user.id

    try {
        await db.query(
            'INSERT INTO server_members (user_id, server_id) VALUES (?, ?)',
            [userId, serverId]
        )

        res.json({ message: 'Joined server' })
    } catch (err) {
        res.status(400).json({
            message: 'Already joined or server not found'
        })
    }
})

/**
 * GET MY SERVERS
 * GET /api/servers/my
 */
router.get('/my', auth, async (req, res) => {
    const userId = req.user.id

    try {
        const [rows] = await db.query(`
            SELECT 
                s.id,
                s.name,
                sm.role,
                s.created_at
            FROM servers s
            JOIN server_members sm ON s.id = sm.server_id
            WHERE sm.user_id = ?
        `, [userId])

        res.json(rows)
    } catch (err) {
        console.error('GET MY SERVERS ERROR:', err)
        res.status(500).json({ message: 'Server error' })
    }
})

const isServerMember = require('../middlewares/serverMember.middleware')

router.get('/:id', auth, isServerMember, async (req, res) => {
    const serverId = req.params.id

    const [rows] = await db.query(
        'SELECT id, name, owner_id, created_at FROM servers WHERE id = ?',
        [serverId]
    )

    res.json({
        ...rows[0],
        role: req.serverRole
    })
})


module.exports = router
