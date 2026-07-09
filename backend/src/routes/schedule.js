const router = require('express').Router()
const prisma = require('../prisma')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  const { week } = req.query
  const start = week ? new Date(week) : (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); d.setHours(0,0,0,0); return d })()
  const end = new Date(start); end.setDate(end.getDate() + 6); end.setHours(23,59,59,999)
  const data = await prisma.schedule.findMany({
    where: { branchId: req.user.branchId, date: { gte: start, lte: end } },
    include: { user: { select: { id: true, name: true, role: true } } },
    orderBy: { date: 'asc' }
  })
  res.json(data)
})

router.post('/', async (req, res) => {
  try {
    const { userId, date, startTime, endTime, note } = req.body
    const data = await prisma.schedule.create({
      data: { branchId: req.user.branchId, userId, date: new Date(date), startTime, endTime, note },
      include: { user: { select: { id: true, name: true, role: true } } }
    })
    res.json(data)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/:id', async (req, res) => {
  await prisma.schedule.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

module.exports = router
