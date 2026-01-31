const db = require('../config/database')

module.exports = async (req, res, next) => {
    const userId = req.user.id
    const serverId = req.params.id || req.params.serverId

    const [rows] = await db.query(
        'SELECT * FROM server_members WHERE user_id = ? AND server_id = ?',
        [userId, serverId]
    )

    if (rows.length === 0) {
        return res.status(403).json({
            message: 'You are not a member of this server'
        })
    }

    req.serverRole = rows[0].role
    next()
}
