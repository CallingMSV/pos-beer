import React, { useEffect, useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'

const TIER_COLOR = { normal: 'text-gray-400', silver: 'text-gray-300', gold: 'text-yellow-400', vip: 'text-primary' }
const empty = { name: '', phone: '', email: '', tier: 'normal' }

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)

  const load = () => api.get('/customers').then(r => setCustomers(r.data))
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      await api.post('/customers', form)
      toast.success('เพิ่มลูกค้าสำเร็จ'); setModal(false); setForm(empty); load()
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ลูกค้า & สมาชิก</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> เพิ่มลูกค้า
        </button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-gray-400">
            <tr>{['ชื่อ', 'เบอร์โทร', 'อีเมล', 'แต้ม', 'ระดับ'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-b border-border hover:bg-bg">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-400">{c.phone || '-'}</td>
                <td className="px-4 py-3 text-gray-400">{c.email || '-'}</td>
                <td className="px-4 py-3">{c.points}</td>
                <td className={`px-4 py-3 font-semibold ${TIER_COLOR[c.tier]}`}>{c.tier.toUpperCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-3">
            <h2 className="font-bold text-lg">เพิ่มลูกค้า</h2>
            {[['name', 'ชื่อ'], ['phone', 'เบอร์โทร'], ['email', 'อีเมล']].map(([k, l]) => (
              <input key={k} placeholder={l} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" />
            ))}
            <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm">
              {['normal', 'silver', 'gold', 'vip'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
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
