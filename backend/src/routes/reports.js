const router = require('express').Router()
const prisma = require('../prisma')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/sales', async (req, res) => {
  const { from, to } = req.query
  const orders = await prisma.order.findMany({
    where: {
      branchId: req.user.branchId,
      status: 'paid',
      paidAt: { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined }
    },
    include: { items: true }
  })
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0)
  const totalOrders = orders.length
  res.json({ totalRevenue, totalOrders, orders })
})

router.get('/top-products', async (req, res) => {
  const items = await prisma.orderItem.groupBy({
    by: ['name'],
    _sum: { qty: true },
    orderBy: { _sum: { qty: 'desc' } },
    take: 10
  })
  res.json(items)
})

module.exports = router
