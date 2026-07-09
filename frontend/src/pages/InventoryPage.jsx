import React, { useEffect, useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'

export default function InventoryPage() {
  const [txs, setTxs] = useState([])
  const [products, setProducts] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ productId: '', type: 'in', qty: '', note: '' })

  const load = () => Promise.all([api.get('/inventory'), api.get('/products')]).then(([t, p]) => { setTxs(t.data); setProducts(p.data) })
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      await api.post('/inventory', form)
      toast.success('บันทึกสำเร็จ'); setModal(false); load()
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> เพิ่มรายการ
        </button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-gray-400">
            <tr>{['สินค้า', 'ประเภท', 'จำนวน', 'หมายเหตุ', 'วันที่'].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {txs.map(t => (
              <tr key={t.id} className="border-b border-border hover:bg-bg">
                <td className="px-4 py-3">{t.product?.name}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-lg text-xs ${t.type === 'in' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{t.type}</span></td>
                <td className="px-4 py-3">{t.qty}</td>
                <td className="px-4 py-3 text-gray-400">{t.note || '-'}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(t.createdAt).toLocaleDateString('th')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-3">
            <h2 className="font-bold text-lg">เพิ่มรายการ Inventory</h2>
            <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm">
              <option value="">-- เลือกสินค้า --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm">
              <option value="in">รับเข้า (in)</option>
              <option value="out">จ่ายออก (out)</option>
              <option value="adjust">ปรับ (adjust)</option>
            </select>
            <input placeholder="จำนวน" type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
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
