const router = require('express').Router()
const prisma = require('../prisma')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  const data = await prisma.bottleKeeper.findMany({
    where: { branchId: req.user.branchId },
    include: { customer: true, product: true }
  })
  res.json(data)
})

router.post('/', async (req, res) => {
  const data = await prisma.bottleKeeper.create({ data: { ...req.body, branchId: req.user.branchId } })
  res.json(data)
})

router.patch('/:id', async (req, res) => {
  const data = await prisma.bottleKeeper.update({ where: { id: req.params.id }, data: req.body })
  res.json(data)
})

module.exports = router
