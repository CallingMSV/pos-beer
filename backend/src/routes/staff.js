const router = require('express').Router()
const bcrypt = require('bcrypt')
const prisma = require('../prisma')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  const data = await prisma.user.findMany({
    where: { branchId: req.user.branchId },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
  })
  res.json(data)
})

router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body
  const passwordHash = await bcrypt.hash(password, 10)
  const data = await prisma.user.create({
    data: { name, email, passwordHash, role, branchId: req.user.branchId }
  })
  res.json({ id: data.id, name: data.name, email: data.email, role: data.role })
})

router.patch('/:id', async (req, res) => {
  const { name, role, isActive } = req.body
  const data = await prisma.user.update({ where: { id: req.params.id }, data: { name, role, isActive } })
  res.json(data)
})

router.patch('/:id/reset-password', async (req, res) => {
  const { password } = req.body
  if (!password || password.length < 4) return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร' })
  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash } })
  res.json({ ok: true })
})

module.exports = router
