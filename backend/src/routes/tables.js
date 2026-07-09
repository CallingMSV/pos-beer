const router = require('express').Router()
const prisma = require('../prisma')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  const tables = await prisma.floorTable.findMany({ where: { branchId: req.user.branchId } })
  res.json(tables)
})

router.post('/', async (req, res) => {
  const table = await prisma.floorTable.create({ data: { ...req.body, branchId: req.user.branchId } })
  res.json(table)
})

router.patch('/:id', async (req, res) => {
  const table = await prisma.floorTable.update({ where: { id: req.params.id }, data: req.body })
  req.io.emit('table:updated', table)
  res.json(table)
})

router.delete('/:id', async (req, res) => {
  await prisma.floorTable.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

module.exports = router
