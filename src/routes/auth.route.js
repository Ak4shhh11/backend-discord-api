const express = require("express")
const router = express.Router()
const db = require("../config/database")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

router.post("/login", async (req, res) => {
  console.log("🔥 LOGIN API KEHIT", req.body)


  try {
    const { email, password } = req.body
    console.log("EMAIL:", email)

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    )

    if (rows.length === 0) {
      return res.status(400).json({ message: "Email tidak ditemukan" })
    }

    const user = rows[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: "Password salah" })
    }

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

module.exports = router
