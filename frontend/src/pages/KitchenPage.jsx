import React, { useEffect, useState } from 'react'
import api from '../api'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const socket = io('/', { path: '/socket.io' })

const STATUS_LABEL = { pending: 'รอทำ', preparing: 'กำลังทำ', ready: 'พร้อมเสิร์ฟ' }
const STATUS_COLOR = { pending: 'bg-yellow-600', preparing: 'bg-blue-600', ready: 'bg-green-600' }

export default function KitchenPage() {
  const [orders, setOrders] = useState([])

  const load = () => api.get('/orders').then(r => setOrders(r.data.filter(o => o.status === 'open')))

  useEffect(() => {
    load()
    socket.on('order:new', load)
    socket.on('order:updated', load)
    return () => { socket.off('order:new'); socket.off('order:updated') }
  }, [])

  const updateItem = async (itemId, status) => {
    await api.patch(`/orders/items/${itemId}/status`, { status })
    load()
    toast.success('อัปเดตสถานะแล้ว')
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <h1 className="text-2xl font-bold mb-6 text-primary">🍳 Kitchen Display</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map(order => (
          <div key={order.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between mb-3">
              <span className="font-bold">{order.table?.name || 'Takeaway'}</span>
              <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('th')}</span>
            </div>
            <div className="space-y-2">
              {order.items?.filter(i => i.status !== 'served').map(item => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm flex-1">{item.qty}x {item.name}</span>
                  <select
                    value={item.status}
                    onChange={e => updateItem(item.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-lg text-white border-0 ${STATUS_COLOR[item.status] || 'bg-gray-600'}`}
                  >
                    {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    <option value="served">เสิร์ฟแล้ว</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-gray-500 col-span-4 text-center mt-20">ไม่มีออเดอร์ที่รอทำ</p>}
      </div>
    </div>
  )
}
