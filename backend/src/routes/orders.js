const router = require('express').Router()
const prisma = require('../prisma')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { branchId: req.user.branchId },
    include: { items: true, table: true, customer: true },
    orderBy: { createdAt: 'desc' }
  })
  res.json(orders)
})

router.get('/:id', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } }, table: true, customer: true, staff: true }
  })
  res.json(order)
})

router.post('/', async (req, res) => {
  try {
    const { tableId, customerId, items, note } = req.body
    // verify staffId exists to avoid FK violation
    const staffExists = await prisma.user.findUnique({ where: { id: req.user.id } })
    const staffId = staffExists ? req.user.id : null
    const order = await prisma.order.create({
      data: {
        branchId: req.user.branchId,
        staffId, tableId, customerId, note,
        items: { create: items.map(i => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty, note: i.note })) }
      },
      include: { items: true }
    })
    if (tableId) await prisma.floorTable.update({ where: { id: tableId }, data: { status: 'occupied' } })
    req.io.emit('order:new', order)
    res.json(order)
  } catch (e) { console.error('POST /orders', e); res.status(500).json({ error: e.message }) }
})

router.patch('/:id/items', async (req, res) => {
  try {
    const { items } = req.body
    await prisma.orderItem.createMany({
      data: items.map(i => ({ orderId: req.params.id, productId: i.productId, name: i.name, price: i.price, qty: i.qty, note: i.note }))
    })
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } })
    req.io.emit('order:updated', order)
    res.json(order)
  } catch (e) { console.error('PATCH /items', e); res.status(500).json({ error: e.message }) }
})

router.patch('/:id/pay', async (req, res) => {
  try {
    const { paymentMethod, discount } = req.body
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } })
    const subtotal = order.items.reduce((s, i) => s + Number(i.price) * i.qty, 0)
    const disc = discount || 0
    const total = subtotal - disc
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'paid', paymentMethod, subtotal, discount: disc, serviceCharge: 0, vat: 0, total, paidAt: new Date() }
    })
    if (order.tableId) await prisma.floorTable.update({ where: { id: order.tableId }, data: { status: 'available' } })
    for (const item of order.items) {
      if (item.productId) {
        await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.qty } } })
      }
    }
    req.io.emit('order:paid', updated)
    res.json(updated)
  } catch (e) { console.error('PATCH /pay', e); res.status(500).json({ error: e.message }) }
})

// ย้ายโต๊ะ: โอนออเดอร์ทั้งหมดจากโต๊ะเดิมไปโต๊ะใหม่
router.patch('/:id/move-table', async (req, res) => {
  const { newTableId } = req.body
  const order = await prisma.order.findUnique({ where: { id: req.params.id } })
  const oldTableId = order.tableId
  const updated = await prisma.order.update({ where: { id: req.params.id }, data: { tableId: newTableId } })
  // ถ้าโต๊ะเดิมไม่มีออเดอร์เปิดอยู่แล้ว → set available
  if (oldTableId) {
    const remaining = await prisma.order.count({ where: { tableId: oldTableId, status: 'open' } })
    if (remaining === 0) await prisma.floorTable.update({ where: { id: oldTableId }, data: { status: 'available' } })
  }
  await prisma.floorTable.update({ where: { id: newTableId }, data: { status: 'occupied' } })
  req.io.emit('order:updated', updated)
  res.json(updated)
})

// แยกโต๊ะ: ย้ายบางรายการออกไปโต๊ะใหม่
router.patch('/:id/split-table', async (req, res) => {
  const { newTableId, itemIds } = req.body
  const sourceOrder = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } })
  const itemsToMove = sourceOrder.items.filter(i => itemIds.includes(i.id))
  // สร้างออเดอร์ใหม่ที่โต๊ะปลายทาง
  const newOrder = await prisma.order.create({
    data: {
      branchId: sourceOrder.branchId,
      staffId: sourceOrder.staffId,
      tableId: newTableId,
      items: { create: itemsToMove.map(i => ({ productId: i.productId, name: i.name, price: i.price, qty: i.qty })) }
    },
    include: { items: true }
  })
  // ลบรายการออกจากออเดอร์เดิม
  await prisma.orderItem.deleteMany({ where: { id: { in: itemIds } } })
  await prisma.floorTable.update({ where: { id: newTableId }, data: { status: 'occupied' } })
  req.io.emit('order:updated', newOrder)
  res.json(newOrder)
})

router.patch('/:id/cancel', async (req, res) => {
  const order = await prisma.order.update({ where: { id: req.params.id }, data: { status: 'cancelled' } })
  if (order.tableId) await prisma.floorTable.update({ where: { id: order.tableId }, data: { status: 'available' } })
  req.io.emit('order:cancelled', order)
  res.json(order)
})

router.delete('/items/:itemId', async (req, res) => {
  try {
    const { qty } = req.body
    const item = await prisma.orderItem.findUnique({ where: { id: req.params.itemId } })
    if (!item) return res.status(404).json({ error: 'not found' })
    if (!qty || qty >= item.qty) {
      await prisma.orderItem.delete({ where: { id: req.params.itemId } })
    } else {
      await prisma.orderItem.update({ where: { id: req.params.itemId }, data: { qty: item.qty - qty } })
    }
    res.json({ ok: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.patch('/items/:itemId/status', async (req, res) => {
  const item = await prisma.orderItem.update({ where: { id: req.params.itemId }, data: { status: req.body.status } })
  req.io.emit('item:status', item)
  res.json(item)
})

module.exports = router
