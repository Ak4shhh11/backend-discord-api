const express = require("express")
const router = express.Router()
const db = require("../config/database")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Data tidak lengkap" })
    }

    // cek email sudah ada?
    const [exist] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    )

    if (exist.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    )

    return res.status(201).json({
      message: "Register sukses"
    })

  } catch (err) {
    console.error("❌ REGISTER ERROR:", err)
    return res.status(500).json({ message: "Server error" })
  }
})

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    )

    if (rows.length === 0)
      return res.status(400).json({ message: "Email tidak ditemukan" })

    const user = rows[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch)
      return res.status(400).json({ message: "Password salah" })

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    return res.json({
      message: "Login sukses",
      token
    })

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err)
    return res.status(500).json({ message: "Server error" })
  }
})

router.get('/test', (req, res) => {
  res.json({ message: 'AUTH ROUTE OK' })
})

module.exports = router
