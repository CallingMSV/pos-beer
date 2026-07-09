const router = require('express').Router()
const prisma = require('../prisma')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  const data = await prisma.promotion.findMany({ where: { branchId: req.user.branchId } })
  res.json(data)
})

router.post('/', async (req, res) => {
  const data = await prisma.promotion.create({ data: { ...req.body, branchId: req.user.branchId } })
  res.json(data)
})

router.patch('/:id', async (req, res) => {
  const data = await prisma.promotion.update({ where: { id: req.params.id }, data: req.body })
  res.json(data)
})

router.delete('/:id', async (req, res) => {
  await prisma.promotion.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

module.exports = router
