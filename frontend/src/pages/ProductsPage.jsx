import React, { useEffect, useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { fmt } from '../utils/currency'

const empty = { name: '', price: '', cost: '', stock: '', unit: 'pcs', categoryId: '' }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [catModal, setCatModal] = useState(false)
  const [catName, setCatName] = useState('')
  const [filterCat, setFilterCat] = useState(null)

  const load = () => Promise.all([api.get('/products'), api.get('/categories')]).then(([p, c]) => {
    setProducts(p.data); setCategories(c.data)
  })

  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      if (editing) await api.patch(`/products/${editing}`, form)
      else await api.post('/products', form)
      toast.success('บันทึกสำเร็จ')
      setModal(false); setForm(empty); setEditing(null); load()
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const del = async (id) => {
    if (!confirm('ลบสินค้านี้?')) return
    await api.delete(`/products/${id}`)
    toast.success('ลบแล้ว'); load()
  }

  const openEdit = (p) => { setForm({ name: p.name, price: p.price, cost: p.cost, stock: p.stock, unit: p.unit, categoryId: p.categoryId || '' }); setEditing(p.id); setModal(true) }

  const saveCategory = async () => {
    if (!catName.trim()) return toast.error('กรุณาใส่ชื่อหมวดหมู่')
    try {
      await api.post('/categories', { name: catName.trim() })
      toast.success('เพิ่มหมวดหมู่แล้ว')
      setCatModal(false); setCatName(''); load()
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">เมนู / สินค้า</h1>
        <div className="flex gap-2">
          <button onClick={() => { setCatName(''); setCatModal(true) }} className="flex items-center gap-2 border border-border hover:border-primary text-gray-300 hover:text-primary px-4 py-2 rounded-xl text-sm transition-colors">
            <Plus size={16} /> เพิ่มหมวดหมู่
          </button>
          <button onClick={() => { setForm(empty); setEditing(null); setModal(true) }} className="flex items-center gap-2 bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm">
            <Plus size={16} /> เพิ่มสินค้า
          </button>
        </div>
      </div>

      {/* Filter หมวดหมู่ */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button onClick={() => setFilterCat(null)} className={`px-3 py-1.5 rounded-xl text-sm border transition-colors ${!filterCat ? 'bg-primary border-primary text-white' : 'border-border text-gray-400 hover:border-primary hover:text-primary'}`}>
          ทั้งหมด
        </button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setFilterCat(c.id)} className={`px-3 py-1.5 rounded-xl text-sm border transition-colors ${filterCat === c.id ? 'bg-primary border-primary text-white' : 'border-border text-gray-400 hover:border-primary hover:text-primary'}`}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-gray-400">
            <tr>{['ชื่อ', 'หมวด', 'ราคา', 'ต้นทุน', 'สต็อก', 'หน่วย', ''].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {products.filter(p => !filterCat || p.categoryId === filterCat).map(p => (
              <tr key={p.id} className="border-b border-border hover:bg-bg">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 text-gray-400">{p.category?.name || '-'}</td>
                <td className="px-4 py-3 text-primary">{fmt(p.price)}</td>
                <td className="px-4 py-3 text-gray-400">{fmt(p.cost)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3 text-gray-400">{p.unit}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="p-1.5 hover:text-primary"><Pencil size={14} /></button>
                  <button onClick={() => del(p.id)} className="p-1.5 hover:text-red-400"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {catModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-3">
            <h2 className="font-bold text-lg">เพิ่มหมวดหมู่</h2>
            <input autoFocus placeholder="ชื่อหมวดหมู่" value={catName} onChange={e => setCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveCategory()}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" />
            <div className="flex gap-2 pt-1">
              <button onClick={() => setCatModal(false)} className="flex-1 border border-border rounded-xl py-2 text-sm hover:bg-border">ยกเลิก</button>
              <button onClick={saveCategory} className="flex-1 bg-primary hover:bg-orange-500 text-white rounded-xl py-2 text-sm">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-bold text-lg">{editing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h2>
            {[['name', 'ชื่อสินค้า'], ['price', 'ราคา'], ['cost', 'ต้นทุน'], ['stock', 'สต็อก'], ['unit', 'หน่วย']].map(([k, l]) => (
              <input key={k} placeholder={l} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" />
            ))}
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm">
              <option value="">-- เลือกหมวด --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
