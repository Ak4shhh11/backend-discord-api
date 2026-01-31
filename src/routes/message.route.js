const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth.middleware')
const db = require('../config/database')


// POST message ke channel
router.post('/channel/:channelId', auth, async (req, res) => {

const { content } = req.body
const { channelId } = req.params
const userId = req.user.id

    if (!content || !content.trim())
    return res.status(400).json({ message: 'Message content required' })

    const [rows] = await db.query(`
        SELECT sm.role
        FROM channels c
        JOIN server_members sm ON sm.server_id = c.server_id
        WHERE c.id = ? AND sm.user_id = ?
    `, [channelId, userId])

    if (rows.length === 0)
        return res.status(403).json({ message: 'Not a channel member' })

    const [result] = await db.query(
        'INSERT INTO messages (channel_id, user_id, content, deleted) VALUES (?, ?, ?, false)',
        [channelId, userId, content.trim()]
    )

    const io = req.app.get('io')

        io.to(`channel-${channelId}`).emit('new-message', {
        id: result.insertId,
        content: content.trim(),
        sender: req.user.email,
        created_at: new Date()
    })
    res.status(201).json({
    message: 'Message sent',
    data: {
        id: result.insertId,
        channel_id: channelId,
        content: content.trim(),
        sender: req.user.email
        }
    })
})



// GET message history
router.get('/channel/:channelId', auth, async (req, res) => {
    const { channelId } = req.params
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 50
    const offset = parseInt(req.query.offset) || 0

    const [rows] = await db.query(`
        SELECT m.id, m.content, m.created_at, u.email AS sender
        FROM messages m
        JOIN users u ON u.id = m.user_id
        JOIN channels c ON c.id = m.channel_id
        JOIN server_members sm ON sm.server_id = c.server_id
        WHERE m.channel_id = ?
            AND sm.user_id = ?
            AND m.deleted = false
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?
`, [channelId, userId, limit, offset])

    res.json(rows)
    
})


// PUT message history
router.put('/:messageId', auth, async (req, res) => {
    const { messageId } = req.params
    const { content } = req.body
    const userId = req.user.id

    if (!content)
        return res.status(400).json({ message: 'Content required' })

    const [rows] = await db.query(
        'SELECT id FROM messages WHERE id = ? AND user_id = ?',
        [messageId, userId]
    )

    if (rows.length === 0)
        return res.status(403).json({ message: 'Not your message' })

    await db.query(
        'UPDATE messages SET content = ?, updated_at = NOW() WHERE id = ?',
        [content, messageId]
    )

    res.json({ message: 'Message updated' })
})

// DELETE message history
router.delete('/:messageId', auth, async (req, res) => {
    const { messageId } = req.params
    const userId = req.user.id

    const [rows] = await db.query(
        'SELECT id FROM messages WHERE id = ? AND user_id = ?',
        [messageId, userId]
    )

    if (rows.length === 0)
        return res.status(403).json({ message: 'Not your message' })

    await db.query(
        'UPDATE messages SET deleted=true WHERE id=?',
        [messageId]
    )

    res.json({ message: 'Message deleted' })
})

// SEARCH MESSAGE
router.get('/search/:keyword', auth, async (req, res) => {
    const key = `%${req.params.keyword}%`

    const [rows] = await db.query(`
        SELECT m.id, m.content, u.email
        FROM messages m
        JOIN users u ON u.id = m.user_id
        WHERE m.content LIKE ?
    `, [key])

    res.json(rows)
})

// PIN MESSAGE
router.put('/pin/:id', auth, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params

  const [rows] = await db.query(
    'SELECT id FROM messages WHERE id=? AND user_id=?',
    [id, userId]
  )

  if (rows.length === 0)
    return res.status(403).json({ message: 'Cannot pin this message' })

  await db.query(
    'UPDATE messages SET pinned=true WHERE id=?',
    [id]
  )

  res.json({ message: 'Message pinned' })
})



module.exports = router
