const router = require('express').Router()
const prisma = require('../prisma')
const auth = require('../middleware/auth')

router.use(auth)

const DEFAULT_PERMISSIONS = {
  cashier:  { pos: true,  checkout: true,  floor: true,  products: false, inventory: false, customers: true,  reservations: true,  bottleKeeper: false, promotions: false, staff: false, reports: false },
  kitchen:  { pos: false, checkout: false, floor: false, products: false, inventory: false, customers: false, reservations: false, bottleKeeper: false, promotions: false, staff: false, reports: false },
  bar:      { pos: true,  checkout: false, floor: true,  products: false, inventory: false, customers: false, reservations: false, bottleKeeper: true,  promotions: false, staff: false, reports: false },
  manager:  { pos: true,  checkout: true,  floor: true,  products: true,  inventory: true,  customers: true,  reservations: true,  bottleKeeper: true,  promotions: true,  staff: false, reports: true  },
}

router.get('/', async (req, res) => {
  const branchId = req.user.branchId
  const rows = await prisma.rolePermission.findMany({ where: { branchId } })

  // build permissions object
  const result = {}
  for (const [role, actions] of Object.entries(DEFAULT_PERMISSIONS)) {
    result[role] = { ...actions }
    for (const [action, def] of Object.entries(actions)) {
      const row = rows.find(r => r.role === role && r.action === action)
      if (row) result[role][action] = row.allowed
    }
  }
  res.json(result)
})

router.patch('/:role/:action', async (req, res) => {
  const { role, action } = req.params
  const { allowed } = req.body
  const branchId = req.user.branchId
  await prisma.rolePermission.upsert({
    where: { branchId_role_action: { branchId, role, action } },
    update: { allowed },
    create: { branchId, role, action, allowed }
  })
  res.json({ ok: true })
})

module.exports = router
