import React, { useEffect, useRef, useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus, Minus, CreditCard, ShoppingCart, Printer, X } from 'lucide-react'
import { fmt } from '../utils/currency'
import { useAuthStore } from '../store/authStore'
import { usePermissionsStore } from '../store/permissionsStore'

function ReceiptModal({ data, onClose }) {
  const printRef = useRef()
  if (!data) return null
  const { items, tableName, paid, pm } = data
  const ttl = items.reduce((s, i) => s + Number(i.price) * i.qty, 0)
  const now = new Date()
  const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  const timeStr = now.toLocaleTimeString('th-TH')
  const receiptNo = 'RCP' + now.getFullYear() + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0') + '-' + String(now.getHours()).padStart(2,'0') + String(now.getMinutes()).padStart(2,'0') + String(now.getSeconds()).padStart(2,'0')
  const pmLabel = { cash: 'เงินสด', card: 'บัตรเครดิต', qr: 'QR Code', transfer: 'โอนเงิน' }[pm] || pm || ''

  const handlePrint = () => {
    const content = printRef.current.innerHTML
    const w = window.open('', '_blank', 'width=420,height=700')
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${paid ? 'ใบเสร็จรับเงิน' : 'ใบแจ้งยอด'}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Sarabun',sans-serif;background:#fff;color:#1a1a1a;padding:24px 20px;width:360px;margin:0 auto}
    </style></head><body>${content}</body></html>`)
    w.document.close()
    setTimeout(() => { w.print(); w.close() }, 300)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white text-gray-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b">
          <span className="font-semibold text-sm">{paid ? 'ใบเสร็จรับเงิน' : 'ใบแจ้งยอด'}</span>
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
            <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold border ${paid ? 'bg-green-50 text-green-700 border-green-400' : 'bg-orange-50 text-orange-700 border-orange-400'}`}>
              {paid ? 'ใบเสร็จรับเงิน' : 'ใบแจ้งยอด'}
            </span>
          </div>
          <hr className="border-dashed border-gray-300 my-3" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">เลขที่</span><span className="font-mono text-xs">{receiptNo}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">วันที่</span><span>{dateStr}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">เวลา</span><span>{timeStr}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">โต๊ะ</span><span>{tableName || 'ไม่ระบุโต๊ะ'}</span></div>
          </div>
          <hr className="border-dashed border-gray-300 my-3" />
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs text-gray-400 font-semibold pb-1.5">รายการ</th>
                <th className="text-center text-xs text-gray-400 font-semibold pb-1.5">จำนวน</th>
                <th className="text-right text-xs text-gray-400 font-semibold pb-1.5">ราคา</th>
              </tr>
            </thead>
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
            <span>รวมทั้งหมด</span>
            <span className="text-[#FF7050]">{fmt(ttl)}</span>
          </div>
          {paid && (
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-400">วิธีชำระ</span><span>{pmLabel}</span></div>
              <div className="flex justify-between font-semibold"><span className="text-gray-400">ยอดชำระ</span><span>{fmt(ttl)}</span></div>
            </div>
          )}
          <div className={`mt-3 text-center py-2.5 rounded-xl font-semibold text-sm ${paid ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
            {paid ? '✅ ชำระเงินเรียบร้อยแล้ว' : '⏳ กรุณาชำระเงิน'}
          </div>
          <div className="text-center mt-4 text-xs text-gray-400 leading-6">
            ขอบคุณที่ใช้บริการ 🙏<br />Beer POS Premium
          </div>
        </div>
      </div>
    </div>
  )
}

function SwipeItem({ item, onDelete }) {
  const [offsetX, setOffsetX] = useState(0)
  const startX = useRef(null)
  const isDragging = useRef(false)
  const THRESHOLD = 60

  const onStart = (clientX) => { startX.current = clientX; isDragging.current = true }
  const onMove = (clientX) => {
    if (!isDragging.current) return
    const diff = clientX - startX.current
    if (diff < 0) setOffsetX(Math.max(diff, -THRESHOLD - 20))
  }
  const onEnd = () => {
    isDragging.current = false
    if (offsetX < -THRESHOLD) { setOffsetX(0); onDelete() }
    else setOffsetX(0)
  }

  return (
    <div className="relative overflow-hidden border-b border-border/40">
      {/* red bg */}
      <div className="absolute inset-y-0 right-0 w-16 bg-red-600 flex items-center justify-center rounded-r">
        <X size={16} className="text-white" />
      </div>
      {/* item row */}
      <div
        className="relative flex justify-between items-center text-sm py-1.5 bg-card transition-transform select-none"
        style={{ transform: `translateX(${offsetX}px)` }}
        onMouseDown={e => onStart(e.clientX)}
        onMouseMove={e => onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={e => onStart(e.touches[0].clientX)}
        onTouchMove={e => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
      >
        <span className="text-gray-300">{item.qty}x {item.name}</span>
        <span className="text-gray-400">{fmt(Number(item.price) * item.qty)}</span>
      </div>
    </div>
  )
}

export default function POSPage() {
  const { user } = useAuthStore()
  const { can } = usePermissionsStore()
  const canCheckout = can(user?.role, 'checkout')
  const canDeleteOrder = can(user?.role, 'deleteOrder')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [tables, setTables] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)
  const [cart, setCart] = useState([])
  const [currentOrderId, setCurrentOrderId] = useState(null)
  const [tableOrderItems, setTableOrderItems] = useState([])
  const [payMethod, setPayMethod] = useState('cash')
  const [lastPaidOrder, setLastPaidOrder] = useState(null)
  const [receiptData, setReceiptData] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteQty, setDeleteQty] = useState(1)

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data))
    api.get('/products').then(r => setProducts(r.data))
    api.get('/tables').then(r => setTables(r.data.filter(t => t.status === 'available' || t.status === 'occupied')))
  }, [])

  const loadTableOrders = async (tableId) => {
    if (!tableId) { setTableOrderItems([]); setCurrentOrderId(null); return }
    const res = await api.get('/orders')
    const openOrders = res.data.filter(o => o.tableId === tableId && o.status === 'open')
    if (openOrders.length > 0) {
      setCurrentOrderId(openOrders[0].id)
      setTableOrderItems(openOrders.flatMap(o => o.items))
    } else {
      setCurrentOrderId(null)
      setTableOrderItems([])
    }
  }

  const selectTable = (id) => {
    setSelectedTable(id)
    setCart([])
    loadTableOrders(id)
  }

  const filtered = selectedCat ? products.filter(p => p.categoryId === selectedCat) : products

  const addToCart = (product) => {
    if (product.stock <= 0) return toast.error(`${product.name} สินค้าหมดแล้ว`)
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id)
      const currentQty = existing ? existing.qty : 0
      if (currentQty >= product.stock) return (toast.error(`${product.name} เหลือแค่ ${product.stock} ชิ้น`), prev)
      if (existing) return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { productId: product.id, name: product.name, price: Number(product.price), qty: 1, stock: product.stock }]
    })
  }

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i
      const newQty = i.qty + delta
      if (newQty > i.stock) { toast.error(`เหลือแค่ ${i.stock} ชิ้น`); return i }
      return { ...i, qty: newQty }
    }).filter(i => i.qty > 0))
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const handleOrder = async () => {
    if (!cart.length) return toast.error('กรุณาเลือกสินค้า')
    try {
      if (currentOrderId) {
        await api.patch(`/orders/${currentOrderId}/items`, { items: cart })
        toast.success('เพิ่มรายการเข้าออเดอร์แล้ว')
      } else {
        const res = await api.post('/orders', { tableId: selectedTable, items: cart })
        setCurrentOrderId(res.data.id)
        toast.success('บันทึกออเดอร์ลงโต๊ะแล้ว')
      }
      setCart([])
      loadTableOrders(selectedTable)
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const handleCheckout = async () => {
    if (!currentOrderId) return
    try {
      const res = await api.patch(`/orders/${currentOrderId}/pay`, { paymentMethod: payMethod })
      const paidData = { ...res.data, items: tableOrderItems, tableName: tables.find(t => t.id === selectedTable)?.name }
      setLastPaidOrder(paidData)
      setReceiptData({ items: tableOrderItems, tableName: paidData.tableName, paid: true, pm: payMethod })
      toast.success('ชำระเงินสำเร็จ')
      setCurrentOrderId(null)
      setSelectedTable(null)
      setTableOrderItems([])
      setCart([])
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const deleteItemDirect = async (itemId) => {
    if (!canDeleteOrder) return toast.error('ไม่มีสิทธิ์ลบรายการ')
    try {
      await api.delete(`/orders/items/${itemId}`, { data: { qty: 999 } })
      toast.success('ลบรายการแล้ว')
      loadTableOrders(selectedTable)
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const deleteItem = async () => {
    if (!deleteTarget) return
    if (!canDeleteOrder) return toast.error('ไม่มีสิทธิ์ลบรายการ')
    try {
      await api.delete(`/orders/items/${deleteTarget.id}`, { data: { qty: deleteQty } })
      toast.success('ลบรายการแล้ว')
      setDeleteTarget(null)
      loadTableOrders(selectedTable)
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const tableTotal = tableOrderItems.reduce((s, i) => s + Number(i.price) * i.qty, 0)

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => selectTable(null)} className={`px-3 py-1.5 rounded-xl text-sm border ${!selectedTable ? 'bg-primary border-primary' : 'border-border text-gray-400'}`}>ไม่ระบุโต๊ะ</button>
          {tables.map(t => (
            <button key={t.id} onClick={() => selectTable(t.id)}
              className={`px-3 py-1.5 rounded-xl text-sm border ${selectedTable === t.id ? 'bg-primary border-primary' : 'border-border text-gray-400'}`}>
              {t.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSelectedCat(null)} className={`px-3 py-1.5 rounded-xl text-sm border ${!selectedCat ? 'bg-primary border-primary' : 'border-border text-gray-400'}`}>ทั้งหมด</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-xl text-sm border ${selectedCat === c.id ? 'bg-primary border-primary' : 'border-border text-gray-400'}`}>
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto">
          {filtered.map(p => (
            <button key={p.id} onClick={() => addToCart(p)}
              className={`bg-card border rounded-xl p-3 text-left transition-colors ${p.stock <= 0 ? 'border-border opacity-50 cursor-not-allowed' : 'border-border hover:border-primary'}`}>
              <p className="font-medium text-sm truncate">{p.name}</p>
              <p className="text-primary font-bold mt-1">{fmt(p.price)}</p>
              {p.stock <= 0 && <p className="text-red-400 text-xs mt-1">สินค้าหมด</p>}
            </button>
          ))}
        </div>
      </div>

      <div className="w-72 bg-card border border-border rounded-xl flex flex-col">
        <div className="p-4 border-b border-border font-semibold">รายการสั่ง</div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {tableOrderItems.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">📋 สั่งไปแล้ว</p>
              {tableOrderItems.map(item => (
                <SwipeItem key={item.id} item={item} onDelete={() => deleteItemDirect(item.id)} />
              ))}
              <div className="flex justify-between text-xs text-gray-400 pt-1">
                <span>รวมที่สั่งไปแล้ว</span>
                <span>{fmt(tableTotal)}</span>
              </div>
            </div>
          )}
          {cart.length > 0 && <p className="text-xs text-gray-400 mb-1">🛒 รายการใหม่</p>}
          {cart.length === 0 && tableOrderItems.length === 0 && <p className="text-gray-500 text-sm text-center mt-8">ยังไม่มีรายการ</p>}
          {cart.map(item => (
            <div key={item.productId} className="flex items-center gap-2 bg-bg rounded-xl p-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{item.name}</p>
                <p className="text-primary text-xs">{fmt(item.price * item.qty)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQty(item.productId, -1)} className="p-1 hover:text-primary"><Minus size={14} /></button>
                <span className="text-sm w-5 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.productId, 1)} className="p-1 hover:text-primary"><Plus size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-border text-sm">
            <div className="flex justify-between font-bold text-white text-base"><span>รวมทั้งหมด</span><span>{fmt(total)}</span></div>
          </div>
        )}

        <div className="p-3 space-y-2">
          <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
            className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-white">
            <option value="cash">เงินสด</option>
            <option value="card">บัตรเครดิต</option>
            <option value="qr">QR Code</option>
            <option value="transfer">โอนเงิน</option>
          </select>
          <button onClick={handleOrder} className="w-full bg-primary hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <ShoppingCart size={18} /> สั่งออเดอร์
          </button>
          {currentOrderId && (
            <button
              onClick={() => setReceiptData({ items: tableOrderItems, tableName: tables.find(t => t.id === selectedTable)?.name, paid: false })}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Printer size={18} /> พิมพ์บิล
            </button>
          )}
          {currentOrderId && canCheckout && (
            <button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <CreditCard size={18} /> ชำระเงิน
            </button>
          )}
          {lastPaidOrder && (
            <button
              onClick={() => setReceiptData({ items: lastPaidOrder.items, tableName: lastPaidOrder.tableName, paid: true, pm: lastPaidOrder.paymentMethod })}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Printer size={18} /> พิมพ์อีกครั้ง
            </button>
          )}
        </div>
      </div>

      <ReceiptModal data={receiptData} onClose={() => setReceiptData(null)} />

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-card border border-border rounded-2xl p-5 w-72" onClick={e => e.stopPropagation()}>
            <p className="font-semibold mb-1">ลบรายการ</p>
            <p className="text-sm text-gray-400 mb-4 truncate">{deleteTarget.name} (มี {deleteTarget.qty} ชิ้น)</p>
            <div className="flex items-center justify-center gap-4 mb-5">
              <button onClick={() => setDeleteQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl border border-border hover:border-primary flex items-center justify-center"><Minus size={16} /></button>
              <span className="text-2xl font-bold w-10 text-center">{deleteQty}</span>
              <button onClick={() => setDeleteQty(q => Math.min(deleteTarget.qty, q + 1))} className="w-9 h-9 rounded-xl border border-border hover:border-primary flex items-center justify-center"><Plus size={16} /></button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 border border-border py-2 rounded-xl text-sm">ยกเลิก</button>
              <button onClick={deleteItem} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl text-sm font-semibold">ลบ {deleteQty} ชิ้น</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
