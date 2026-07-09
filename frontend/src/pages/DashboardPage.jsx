import React, { useEffect, useState } from 'react'
import api from '../api'
import { TrendingUp, ShoppingBag, Table2, AlertTriangle } from 'lucide-react'
import { fmt } from '../utils/currency'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}><Icon size={22} className="text-white" /></div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data))
  }, [])

  if (!data) return <div className="text-gray-400">กำลังโหลด...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="ยอดขายวันนี้" value={fmt(data.todayRevenue)} color="bg-primary" />
        <StatCard icon={ShoppingBag} label="ออเดอร์วันนี้" value={data.todayOrders} color="bg-blue-600" />
        <StatCard icon={Table2} label="โต๊ะที่ใช้งาน" value={`${data.occupiedTables}/${data.totalTables}`} color="bg-green-600" />
        <StatCard icon={AlertTriangle} label="สินค้าใกล้หมด" value={data.lowStock.length} color="bg-yellow-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* รายการที่ขายวันนี้ */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4">🛒 ขายวันนี้ (Top 10)</h2>
          {data.todaySoldItems?.length === 0
            ? <p className="text-gray-500 text-sm text-center py-6">ยังไม่มีรายการขาย</p>
            : <div className="space-y-2">
                {data.todaySoldItems?.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-5">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.name}</span>
                        <span className="text-primary font-semibold">{item._sum.qty} ชิ้น</span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(item._sum.qty / data.todaySoldItems[0]._sum.qty) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* สินค้าใกล้หมด */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-semibold mb-4 text-yellow-400">⚠️ สินค้าใกล้หมด</h2>
          {data.lowStock.length === 0
            ? <p className="text-gray-500 text-sm text-center py-6">ไม่มีสินค้าใกล้หมด</p>
            : <div className="space-y-2">
                {data.lowStock.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-sm py-2 border-b border-border/40">
                    <span>{p.name}</span>
                    <span className="bg-yellow-900 text-yellow-400 font-bold px-2 py-0.5 rounded-lg text-xs">เหลือ {p.stock} {p.unit}</span>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  )
}
