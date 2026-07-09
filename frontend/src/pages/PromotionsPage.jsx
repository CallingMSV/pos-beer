import React, { useEffect, useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import { fmt } from '../utils/currency'

const empty = { name: '', type: 'percent', value: '', minAmount: '', startsAt: '', endsAt: '' }

export default function PromotionsPage() {
  const [promos, setPromos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)

  const load = () => api.get('/promotions').then(r => setPromos(r.data))
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      await api.post('/promotions', form)
      toast.success('บันทึกสำเร็จ'); setModal(false); setForm(empty); load()
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const del = async (id) => {
    await api.delete(`/promotions/${id}`)
    toast.success('ลบแล้ว'); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">โปรโมชัน</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> เพิ่มโปรโมชัน
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map(p => (
          <div key={p.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-sm text-gray-400 mt-1">{p.type} — {p.type === 'percent' ? `${p.value}%` : fmt(p.value)}</p>
                {p.minAmount > 0 && <p className="text-xs text-gray-500">ขั้นต่ำ {fmt(p.minAmount)}</p>}
              </div>
              <button onClick={() => del(p.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={16} /></button>
            </div>
            <div className={`mt-3 text-xs px-2 py-1 rounded-lg inline-block ${p.isActive ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
              {p.isActive ? 'ใช้งาน' : 'ปิด'}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-3">
            <h2 className="font-bold text-lg">เพิ่มโปรโมชัน</h2>
            <input placeholder="ชื่อโปรโมชัน" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm">
              <option value="percent">ลด %</option>
              <option value="fixed">ลดคงที่ (₭)</option>
              <option value="buy_x_get_y">ซื้อ X แถม Y</option>
            </select>
            {[['value', 'มูลค่า'], ['minAmount', 'ยอดขั้นต่ำ']].map(([k, l]) => (
              <input key={k} placeholder={l} type="number" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" />
            ))}
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
