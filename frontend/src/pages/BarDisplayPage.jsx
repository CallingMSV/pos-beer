import React, { useEffect, useState } from 'react'
import api from '../api'
import { io } from 'socket.io-client'

const socket = io('/', { path: '/socket.io' })

export default function BarDisplayPage() {
  const [orders, setOrders] = useState([])

  const load = () => api.get('/orders').then(r => {
    const drinkOrders = r.data.filter(o => o.status === 'open').map(o => ({
      ...o, items: o.items?.filter(i => i.status !== 'served')
    })).filter(o => o.items?.length > 0)
    setOrders(drinkOrders)
  })

  useEffect(() => {
    load()
    socket.on('order:new', load)
    socket.on('order:updated', load)
    return () => { socket.off('order:new'); socket.off('order:updated') }
  }, [])

  return (
    <div className="min-h-screen bg-bg p-6">
      <h1 className="text-2xl font-bold mb-6 text-primary">🍺 Bar Display</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {orders.map(order => (
          <div key={order.id} className="bg-card border border-primary rounded-xl p-4">
            <p className="font-bold text-primary mb-2">{order.table?.name || 'Takeaway'}</p>
            {order.items?.map(item => (
              <div key={item.id} className="text-sm py-1 border-b border-border last:border-0">
                {item.qty}x {item.name}
              </div>
            ))}
          </div>
        ))}
        {orders.length === 0 && <p className="text-gray-500 col-span-4 text-center mt-20">ไม่มีออเดอร์</p>}
      </div>
    </div>
  )
}
