import React, { useEffect, useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'

export default function BottleKeeperPage() {
  const [bottles, setBottles] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ customerId: '', productId: '', bottleLabel: '', remaining: '', note: '' })

  const load = () => Promise.all([api.get('/bottle-keepers'), api.get('/products'), api.get('/customers')]).then(([b, p, c]) => {
    setBottles(b.data); setProducts(p.data); setCustomers(c.data)
  })
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      await api.post('/bottle-keepers', form)
      toast.success('บันทึกสำเร็จ'); setModal(false); load()
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Bottle Keeper</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> เพิ่มขวด
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {bottles.map(b => (
          <div key={b.id} className="bg-card border border-border rounded-xl p-4">
            <p className="font-bold text-primary">{b.bottleLabel || b.product?.name}</p>
            <p className="text-sm text-gray-400 mt-1">{b.customer?.name}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1"><span>เหลือ</span><span>{b.remaining} ml</span></div>
              <div className="h-2 bg-bg rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, (b.remaining / 750) * 100)}%` }} />
              </div>
            </div>
            {b.note && <p className="text-xs text-gray-500 mt-2">{b.note}</p>}
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-3">
            <h2 className="font-bold text-lg">เพิ่มขวด</h2>
            <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm">
              <option value="">-- เลือกลูกค้า --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm">
              <option value="">-- เลือกสินค้า --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {[['bottleLabel', 'Label ขวด'], ['remaining', 'ปริมาณที่เหลือ (ml)'], ['note', 'หมายเหตุ']].map(([k, l]) => (
              <input key={k} placeholder={l} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
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
