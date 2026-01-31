const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth.middleware')
const isServerMember = require('../middlewares/serverMember.middleware')
const db = require('../config/database')

/**
 * CREATE CHANNEL (OWNER ONLY)
 * POST /api/servers/:serverId/channels
 */
router.post('/:serverId/channels', auth, isServerMember, async (req, res) => {
    const { name, type } = req.body
    const serverId = req.params.serverId

    if (req.serverRole !== 'owner') {
        return res.status(403).json({
            message: 'Only owner can create channels'
        })
    }

    if (!name) {
        return res.status(400).json({ message: 'Channel name required' })
    }

    await db.query(
        'INSERT INTO channels (server_id, name, type) VALUES (?, ?, ?)',
        [serverId, name, type || 'text']
    )

    res.json({ message: 'Channel created' })
})

/**
 * GET CHANNELS IN SERVER
 * GET /api/servers/:serverId/channels
 */
router.get('/:serverId/channels', auth, isServerMember, async (req, res) => {
    const serverId = req.params.serverId

    const [rows] = await db.query(
        'SELECT id, name, type, created_at FROM channels WHERE server_id = ?',
        [serverId]
    )

    res.json(rows)
})

module.exports = router
