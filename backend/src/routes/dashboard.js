const router = require('express').Router()
const prisma = require('../prisma')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  const branchId = req.user.branchId
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const [todayOrders, openOrders, totalTables, occupiedTables, lowStock, todaySoldItems] = await Promise.all([
    prisma.order.findMany({ where: { branchId, status: 'paid', paidAt: { gte: today } } }),
    prisma.order.count({ where: { branchId, status: 'open' } }),
    prisma.floorTable.count({ where: { branchId } }),
    prisma.floorTable.count({ where: { branchId, status: 'occupied' } }),
    prisma.product.findMany({ where: { branchId, stock: { lte: 5 }, isActive: true } }),
    prisma.orderItem.groupBy({
      by: ['name'],
      where: { order: { branchId, status: 'paid', paidAt: { gte: today } } },
      _sum: { qty: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: 10
    })
  ])

  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total), 0)

  res.json({ todayRevenue, todayOrders: todayOrders.length, openOrders, totalTables, occupiedTables, lowStock, todaySoldItems })
})

module.exports = router
