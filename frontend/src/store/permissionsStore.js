import { create } from 'zustand'
import api from '../api'

const DEFAULT_PERMISSIONS = {
  cashier:  { pos: true,  checkout: true,  floor: true,  products: false, inventory: false, customers: true,  reservations: true,  bottleKeeper: false, promotions: false, staff: false, reports: false, deleteOrder: false },
  kitchen:  { pos: false, checkout: false, floor: false, products: false, inventory: false, customers: false, reservations: false, bottleKeeper: false, promotions: false, staff: false, reports: false, deleteOrder: false },
  bar:      { pos: true,  checkout: false, floor: true,  products: false, inventory: false, customers: false, reservations: false, bottleKeeper: true,  promotions: false, staff: false, reports: false, deleteOrder: false },
  manager:  { pos: true,  checkout: true,  floor: true,  products: true,  inventory: true,  customers: true,  reservations: true,  bottleKeeper: true,  promotions: true,  staff: false, reports: true,  deleteOrder: true  },
  superadmin:{ pos: true, checkout: true,  floor: true,  products: true,  inventory: true,  customers: true,  reservations: true,  bottleKeeper: true,  promotions: true,  staff: true,  reports: true,  deleteOrder: true  },
}

export const PERMISSION_LABELS = {
  pos: 'POS สั่งออเดอร์',
  checkout: 'ชำระเงิน',
  floor: 'Floor Plan',
  products: 'เมนู/สินค้า',
  inventory: 'Inventory',
  customers: 'ลูกค้า',
  reservations: 'การจอง',
  bottleKeeper: 'Bottle Keeper',
  promotions: 'โปรโมชัน',
  staff: 'พนักงาน',
  reports: 'รายงาน',
  deleteOrder: 'ลบรายการออเดอร์',
}

export const usePermissionsStore = create((set, get) => ({
  permissions: DEFAULT_PERMISSIONS,

  fetch: async () => {
    try {
      const res = await api.get('/permissions')
      set({ permissions: { ...DEFAULT_PERMISSIONS, ...res.data } })
    } catch {}
  },

  can: (role, action) => {
    if (role === 'superadmin') return true
    return get().permissions[role]?.[action] ?? false
  },

  toggle: async (role, action) => {
    const current = get().permissions[role]?.[action] ?? false
    const newVal = !current
    set(s => ({
      permissions: {
        ...s.permissions,
        [role]: { ...s.permissions[role], [action]: newVal }
      }
    }))
    await api.patch(`/permissions/${role}/${action}`, { allowed: newVal })
  }
}))
