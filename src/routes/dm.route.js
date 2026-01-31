const router = require('express').Router()
const auth = require('../middlewares/auth.middleware')
const db = require('../config/database')

// start dm
router.post('/start/:userId', auth, async (req, res) => {
    const me = req.user.id
    const other = parseInt(req.params.userId)

    // 1. Cek target user ada
    const [user] = await db.query(
        'SELECT id FROM users WHERE id=?',
        [other]
    )

    if (user.length === 0)
        return res.status(404).json({ message: 'User not found' })

    // 2. Cek apakah conversation sudah ada
    const [existing] = await db.query(`
        SELECT c.id
        FROM conversations c
        JOIN dm_members m1 ON c.id = m1.conversation_id
        JOIN dm_members m2 ON c.id = m2.conversation_id
        WHERE m1.user_id = ? AND m2.user_id = ?
    `, [me, other])

    if (existing.length > 0) {
        return res.json({ conversationId: existing[0].id })
    }

    // 3. Buat conversation baru
    const [conv] = await db.query(
        'INSERT INTO conversations (created_at) VALUES (NOW())'

    )

    // 4. Masukkan member (IGNORE supaya aman)
    await db.query(
        'INSERT IGNORE INTO dm_members (conversation_id, user_id) VALUES (?, ?), (?, ?)',
        [conv.insertId, me, conv.insertId, other]
    )

    res.json({ conversationId: conv.insertId })
})


// send dm
router.post('/:convId', auth, async (req, res) => {
  const { content } = req.body

  const [conv] = await db.query(
    'SELECT id FROM conversations WHERE id = ?',
    [req.params.convId]
  )

  if (conv.length === 0) {
    return res.status(404).json({
      message: 'Conversation not found'
    })
  }

  await db.query(
    'INSERT INTO dm_messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
    [req.params.convId, req.user.id, content]
  )

  res.json({ message: 'DM sent' })
})


// get dm history
router.get('/:convId', auth, async (req, res) => {
    const [rows] = await db.query(`
        SELECT d.content, u.email, d.created_at
        FROM dm_messages d
        JOIN users u ON u.id = d.sender_id
        WHERE conversation_id = ?
        ORDER BY d.created_at
    `, [req.params.convId])

    res.json(rows)
})

module.exports = router
