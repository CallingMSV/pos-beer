const router = require('express').Router()
const prisma = require('../prisma')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  const products = await prisma.product.findMany({
    where: { branchId: req.user.branchId, isActive: true },
    include: { category: true }
  })
  res.json(products)
})

function sanitize(body) {
  const d = { ...body }
  if (d.price !== undefined) d.price = parseFloat(d.price)
  if (d.cost !== undefined) d.cost = parseFloat(d.cost)
  if (d.stock !== undefined) d.stock = parseInt(d.stock)
  if (d.categoryId === '') delete d.categoryId
  return d
}

router.post('/', async (req, res) => {
  const product = await prisma.product.create({ data: { ...sanitize(req.body), branchId: req.user.branchId } })
  res.json(product)
})

router.patch('/:id', async (req, res) => {
  const product = await prisma.product.update({ where: { id: req.params.id }, data: sanitize(req.body) })
  res.json(product)
})

router.delete('/:id', async (req, res) => {
  await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } })
  res.json({ ok: true })
})

module.exports = router
