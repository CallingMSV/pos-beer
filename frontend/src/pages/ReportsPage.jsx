import React, { useEffect, useRef, useState } from 'react'
import api from '../api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { fmt } from '../utils/currency'
import { Printer, X, FileText } from 'lucide-react'

function ReceiptModal({ order, onClose }) {
  const printRef = useRef()
  if (!order) return null
  const items = order.items || []
  const ttl = Number(order.total) || items.reduce((s, i) => s + Number(i.price) * i.qty, 0)
  const pmLabel = { cash: 'เงินสด', card: 'บัตรเครดิต', qr: 'QR Code', transfer: 'โอนเงิน' }[order.paymentMethod] || order.paymentMethod || ''
  const paidAt = order.paidAt ? new Date(order.paidAt) : new Date(order.createdAt)
  const dateStr = paidAt.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = paidAt.toLocaleTimeString('th-TH')
  const receiptNo = 'RCP' + paidAt.getFullYear() + String(paidAt.getMonth()+1).padStart(2,'0') + String(paidAt.getDate()).padStart(2,'0') + '-' + order.id.slice(-6).toUpperCase()

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=420,height=700')
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>ใบเสร็จรับเงิน</title>
    <style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Sarabun',sans-serif;background:#fff;color:#1a1a1a;padding:24px 20px;width:360px;margin:0 auto}
    </style></head><body>${printRef.current.innerHTML}</body></html>`)
    w.document.close()
    setTimeout(() => { w.print(); w.close() }, 300)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white text-gray-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b">
          <span className="font-semibold text-sm">ใบเสร็จรับเงิน</span>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-1.5 bg-[#FF7050] hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">
              <Printer size={14} /> พิมพ์
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg"><X size={16} /></button>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[75vh] p-5" ref={printRef}>
          <div className="text-center mb-4">
            <div className="text-3xl mb-1">🍺</div>
            <div className="text-xl font-bold text-[#FF7050] tracking-wide">BEER POS</div>
            <div className="text-xs text-gray-500 mt-0.5">ระบบจัดการร้านเบียร์</div>
            <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-400">ใบเสร็จรับเงิน</span>
          </div>
          <hr className="border-dashed border-gray-300 my-3" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">เลขที่</span><span className="font-mono text-xs">{receiptNo}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">วันที่</span><span>{dateStr}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">เวลา</span><span>{timeStr}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">โต๊ะ</span><span>{order.table?.name || 'ไม่ระบุ'}</span></div>
          </div>
          <hr className="border-dashed border-gray-300 my-3" />
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200">
              <th className="text-left text-xs text-gray-400 font-semibold pb-1.5">รายการ</th>
              <th className="text-center text-xs text-gray-400 font-semibold pb-1.5">จำนวน</th>
              <th className="text-right text-xs text-gray-400 font-semibold pb-1.5">ราคา</th>
            </tr></thead>
            <tbody>
              {items.map((i, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-1.5">{i.name}</td>
                  <td className="text-center text-gray-500">{i.qty}</td>
                  <td className="text-right">{fmt(Number(i.price) * i.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr className="border-dashed border-gray-300 my-3" />
          <div className="flex justify-between font-bold text-base">
            <span>รวมทั้งหมด</span><span className="text-[#FF7050]">{fmt(ttl)}</span>
          </div>
          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-400">วิธีชำระ</span><span>{pmLabel}</span></div>
            <div className="flex justify-between font-semibold"><span className="text-gray-400">ยอดชำระ</span><span>{fmt(ttl)}</span></div>
          </div>
          <div className="mt-3 text-center py-2.5 rounded-xl font-semibold text-sm bg-green-50 text-green-700">✅ ชำระเงินเรียบร้อยแล้ว</div>
          <div className="text-center mt-4 text-xs text-gray-400 leading-6">ขอบคุณที่ใช้บริการ 🙏<br />Beer POS Premium</div>
        </div>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [sales, setSales] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [orders, setOrders] = useState([])
  const [showOrders, setShowOrders] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const load = () => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    Promise.all([
      api.get(`/reports/sales?${params}`),
      api.get('/reports/top-products'),
      api.get('/orders')
    ]).then(([s, t, o]) => {
      setSales(s.data)
      setTopProducts(t.data)
      const paid = o.data.filter(x => x.status === 'paid')
      setOrders(paid)
    })
  }

  useEffect(() => { load() }, [])

  const chartData = topProducts.map(p => ({ name: p.name, qty: p._sum.qty }))

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">รายงาน</h1>

      <div className="flex gap-3 mb-6 items-end">
        <div>
          <label className="text-xs text-gray-400 block mb-1">จากวันที่</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="bg-card border border-border rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">ถึงวันที่</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="bg-card border border-border rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <button onClick={load} className="bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm">ค้นหา</button>
      </div>

      {sales && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-gray-400 text-sm">ยอดขายรวม</p>
            <p className="text-3xl font-bold text-primary mt-1">{fmt(sales.totalRevenue)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-gray-400 text-sm">จำนวนออเดอร์</p>
            <p className="text-3xl font-bold mt-1">{sales.totalOrders}</p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setShowOrders(v => !v)}
          className="flex items-center gap-2 bg-card border border-border hover:border-primary px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <FileText size={16} className="text-primary" />
          ดูใบเสร็จรับเงิน
          <span className="ml-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">{orders.length}</span>
        </button>

        {showOrders && (
          <div className="mt-3 bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border font-semibold text-sm">รายการใบเสร็จทั้งหมด ({orders.length} รายการ)</div>
            <div className="max-h-80 overflow-y-auto">
              {orders.length === 0 && <p className="text-gray-500 text-sm text-center py-6">ไม่มีข้อมูล</p>}
              {orders.map(o => (
                <div key={o.id} className="flex items-center justify-between px-4 py-3 border-b border-border/50 hover:bg-bg transition-colors">
                  <div>
                    <p className="text-sm font-medium">{'RCP-' + o.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{new Date(o.paidAt || o.createdAt).toLocaleString('th-TH')} · {o.table?.name || 'ไม่ระบุโต๊ะ'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-primary font-semibold text-sm">{fmt(Number(o.total))}</span>
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="flex items-center gap-1 bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                      <Printer size={12} /> ดูใบเสร็จ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold mb-4">สินค้าขายดี Top 10</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#1C1C2B', border: '1px solid #2A2A3A', borderRadius: 12 }} />
            <Bar dataKey="qty" fill="#FF7050" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ReceiptModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  )
}
