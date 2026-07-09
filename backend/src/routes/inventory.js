const router = require('express').Router()
const prisma = require('../prisma')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  const data = await prisma.inventoryTransaction.findMany({
    where: { branchId: req.user.branchId },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  })
  res.json(data)
})

router.post('/', async (req, res) => {
  const { productId, type, qty, note } = req.body
  const tx = await prisma.inventoryTransaction.create({
    data: { branchId: req.user.branchId, productId, type, qty, note, createdBy: req.user.id }
  })
  const delta = type === 'in' ? qty : type === 'out' ? -qty : qty
  await prisma.product.update({ where: { id: productId }, data: { stock: { increment: delta } } })
  res.json(tx)
})

module.exports = router
