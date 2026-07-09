const router = require('express').Router()
const prisma = require('../prisma')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  const data = await prisma.reservation.findMany({
    where: { branchId: req.user.branchId },
    include: { table: true, customer: true },
    orderBy: { reservedAt: 'asc' }
  })
  res.json(data)
})

router.post('/', async (req, res) => {
  try {
    const { tableId, customerId, reservedAt, guests, note, status } = req.body
    const data = await prisma.reservation.create({
      data: {
        branchId: req.user.branchId,
        tableId: tableId || null,
        customerId: customerId || null,
        reservedAt: new Date(reservedAt),
        guests: guests ? Number(guests) : 1,
        note: note || null,
        status: status || 'pending'
      },
      include: { table: true, customer: true }
    })
    if (tableId) {
      await prisma.floorTable.update({ where: { id: tableId }, data: { status: 'reserved' } })
    }
    req.io.emit('reservation:new', data)
    res.json(data)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', async (req, res) => {
  const data = await prisma.reservation.findUnique({ where: { id: req.params.id } })
  await prisma.reservation.delete({ where: { id: req.params.id } })
  if (data?.tableId) await prisma.floorTable.update({ where: { id: data.tableId }, data: { status: 'available' } })
  res.json({ ok: true })
})

router.patch('/:id', async (req, res) => {
  const data = await prisma.reservation.update({ where: { id: req.params.id }, data: req.body, include: { table: true } })
  if (req.body.status === 'cancelled' || req.body.status === 'done') {
    if (data.tableId) await prisma.floorTable.update({ where: { id: data.tableId }, data: { status: 'available' } })
  }
  res.json(data)
})

module.exports = router
