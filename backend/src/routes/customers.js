const router = require('express').Router()
const prisma = require('../prisma')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  const data = await prisma.customer.findMany({ where: { branchId: req.user.branchId }, orderBy: { createdAt: 'desc' } })
  res.json(data)
})

router.post('/', async (req, res) => {
  const data = await prisma.customer.create({ data: { ...req.body, branchId: req.user.branchId } })
  res.json(data)
})

router.patch('/:id', async (req, res) => {
  const data = await prisma.customer.update({ where: { id: req.params.id }, data: req.body })
  res.json(data)
})

module.exports = router
