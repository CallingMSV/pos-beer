import React, { useEffect, useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'

const STATUS_COLOR = { pending: 'text-yellow-400', confirmed: 'text-green-400', cancelled: 'text-red-400', done: 'text-gray-400' }

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [tables, setTables] = useState([])
  const [customers, setCustomers] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ tableId: '', customerId: '', reservedAt: '', guests: 1, note: '' })

  const load = () => Promise.all([api.get('/reservations'), api.get('/tables'), api.get('/customers')]).then(([r, t, c]) => {
    setReservations(r.data); setTables(t.data); setCustomers(c.data)
  })
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      await api.post('/reservations', form)
      toast.success('จองสำเร็จ'); setModal(false); load()
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const del = async (id, tableId) => {
    if (!confirm('ลบการจองนี้?')) return
    await api.delete(`/reservations/${id}`)
    if (tableId) await api.patch(`/tables/${tableId}`, { status: 'available' })
    toast.success('ลบแล้ว'); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">การจอง</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> เพิ่มการจอง
        </button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-gray-400">
            <tr>{['โต๊ะ', 'ลูกค้า', 'วันเวลา', 'จำนวน', 'สถานะ', ''].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.id} className="border-b border-border hover:bg-bg">
                <td className="px-4 py-3">{r.table?.name || '-'}</td>
                <td className="px-4 py-3">{r.customer?.name || '-'}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(r.reservedAt).toLocaleString('th')}</td>
                <td className="px-4 py-3">{r.guests} คน</td>
                <td className={`px-4 py-3 font-semibold ${STATUS_COLOR[r.status]}`}>{r.status}</td>
                <td className="px-4 py-3">
                  <button onClick={() => del(r.id, r.tableId)} className="p-1.5 hover:text-red-400 text-gray-500"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-3">
            <h2 className="font-bold text-lg">เพิ่มการจอง</h2>
            <select value={form.tableId} onChange={e => setForm(f => ({ ...f, tableId: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm">
              <option value="">-- เลือกโต๊ะ --</option>
              {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm">
              <option value="">-- เลือกลูกค้า --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="datetime-local" value={form.reservedAt} onChange={e => setForm(f => ({ ...f, reservedAt: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" />
            <input type="number" placeholder="จำนวนคน" value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" />
            <input placeholder="หมายเหตุ" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" />
            <div className="flex gap-2 pt-2">
              <button onClick={() => setModal(false)} className="flex-1 border border-border rounded-xl py-2 text-sm hover:bg-border">ยกเลิก</button>
              <button onClick={save} className="flex-1 bg-primary hover:bg-orange-500 text-white rounded-xl py-2 text-sm">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
