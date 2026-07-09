const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma')

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !await bcrypt.compare(password, user.passwordHash))
    return res.status(401).json({ message: 'Invalid credentials' })
  const token = jwt.sign(
    { id: user.id, role: user.role, branchId: user.branchId },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  )
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

router.post('/register', async (req, res) => {
  const { name, email, password, role, branchId } = req.body
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, passwordHash, role, branchId } })
  res.json(user)
})

module.exports = router
