import React, { useEffect, useState, useRef } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus, X, ArrowRightLeft, Scissors } from 'lucide-react'
import { fmt } from '../utils/currency'

const STATUS_COLOR = {
  available: 'border-green-500 text-green-400',
  occupied: 'border-primary text-primary',
  reserved: 'border-yellow-500 text-yellow-400'
}

export default function FloorPlanPage() {
  const [tables, setTables] = useState([])
  const [dragging, setDragging] = useState(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [selectedTable, setSelectedTable] = useState(null)
  const [tableOrders, setTableOrders] = useState([])
  const didDrag = useRef(false)

  // ย้ายโต๊ะ
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [moveTargetId, setMoveTargetId] = useState('')

  // แยกโต๊ะ
  const [showSplitModal, setShowSplitModal] = useState(false)
  const [splitTargetId, setSplitTargetId] = useState('')
  const [splitSelectedItems, setSplitSelectedItems] = useState([])

  useEffect(() => { api.get('/tables').then(r => setTables(r.data)) }, [])

  const addTable = async () => {
    const name = `T${tables.length + 1}`
    const { data } = await api.post('/tables', { name, posX: 50, posY: 50 })
    setTables(prev => [...prev, data])
  }

  const onMouseDown = (e, table) => {
    didDrag.current = false
    setDragging(table.id)
    setOffset({ x: e.clientX - table.posX, y: e.clientY - table.posY })
  }

  const onMouseMove = (e) => {
    if (!dragging) return
    didDrag.current = true
    setTables(prev => prev.map(t => t.id === dragging ? { ...t, posX: e.clientX - offset.x, posY: e.clientY - offset.y } : t))
  }

  const onMouseUp = async () => {
    if (!dragging) return
    const table = tables.find(t => t.id === dragging)
    if (didDrag.current) {
      await api.patch(`/tables/${dragging}`, { posX: table.posX, posY: table.posY })
    } else {
      const res = await api.get('/orders')
      const orders = res.data.filter(o => o.tableId === table.id && o.status === 'open')
      setTableOrders(orders)
      setSelectedTable(table)
    }
    setDragging(null)
  }

  const closeAll = () => {
    setSelectedTable(null)
    setShowMoveModal(false)
    setShowSplitModal(false)
    setMoveTargetId('')
    setSplitTargetId('')
    setSplitSelectedItems([])
  }

  const handleMoveTable = async () => {
    if (!moveTargetId) return toast.error('กรุณาเลือกโต๊ะปลายทาง')
    try {
      for (const order of tableOrders) {
        await api.patch(`/orders/${order.id}/move-table`, { newTableId: moveTargetId })
      }
      const refreshed = await api.get('/tables')
      setTables(refreshed.data)
      toast.success('ย้ายโต๊ะสำเร็จ')
      closeAll()
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const handleSplitTable = async () => {
    if (!splitTargetId) return toast.error('กรุณาเลือกโต๊ะปลายทาง')
    if (splitSelectedItems.length === 0) return toast.error('กรุณาเลือกรายการที่ต้องการแยก')
    try {
      // ใช้ออเดอร์แรกเป็น source
      const sourceOrder = tableOrders[0]
      await api.patch(`/orders/${sourceOrder.id}/split-table`, {
        newTableId: splitTargetId,
        itemIds: splitSelectedItems
      })
      const refreshed = await api.get('/tables')
      setTables(refreshed.data)
      toast.success('แยกโต๊ะสำเร็จ')
      closeAll()
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const toggleSplitItem = (itemId) => {
    setSplitSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]
    )
  }

  const otherTables = tables.filter(t => t.id !== selectedTable?.id)
  const allItems = tableOrders.flatMap(o => o.items)

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Floor Plan</h1>
        <button onClick={addTable} className="flex items-center gap-2 bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm">
          <Plus size={16} /> เพิ่มโต๊ะ
        </button>
      </div>
      <div className="flex gap-4 mb-4 text-sm">
        {Object.entries(STATUS_COLOR).map(([s, c]) => (
          <span key={s} className={`border rounded-lg px-3 py-1 ${c}`}>{s}</span>
        ))}
      </div>
      <div
        className="relative bg-card border border-border rounded-xl overflow-hidden"
        style={{ height: '70vh' }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {tables.map(table => (
          <div
            key={table.id}
            onMouseDown={e => onMouseDown(e, table)}
            className={`absolute select-none cursor-grab active:cursor-grabbing border-2 rounded-xl w-20 h-20 flex flex-col items-center justify-center text-sm font-semibold ${STATUS_COLOR[table.status] || 'border-border text-gray-400'}`}
            style={{ left: table.posX, top: table.posY }}
          >
            <span>{table.name}</span>
            <span className="text-xs font-normal opacity-70">{table.capacity} คน</span>
          </div>
        ))}
      </div>

      {/* Modal รายการสั่ง */}
      {selectedTable && !showMoveModal && !showSplitModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={closeAll}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{selectedTable.name} — รายการสั่ง</h2>
              <button onClick={closeAll}><X size={20} /></button>
            </div>

            {tableOrders.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">ไม่มีออเดอร์ที่เปิดอยู่</p>
            ) : tableOrders.map(order => (
              <div key={order.id} className="mb-4">
                <p className="text-xs text-gray-400 mb-2">{new Date(order.createdAt).toLocaleString('th')}</p>
                <div className="space-y-1">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.qty}x {item.name}</span>
                      <span className="text-primary">{fmt(Number(item.price) * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-2 pt-2 flex justify-between font-semibold text-sm">
                  <span>รวม</span>
                  <span>{fmt(order.items.reduce((s, i) => s + Number(i.price) * i.qty, 0))}</span>
                </div>
              </div>
            ))}

            {tableOrders.length > 0 && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowMoveModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-sm font-semibold"
                >
                  <ArrowRightLeft size={15} /> ย้ายโต๊ะ
                </button>
                <button
                  onClick={() => setShowSplitModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-xl text-sm font-semibold"
                >
                  <Scissors size={15} /> แยกโต๊ะ
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal ย้ายโต๊ะ */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={closeAll}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">ย้ายโต๊ะ — {selectedTable.name}</h2>
              <button onClick={closeAll}><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-400 mb-3">เลือกโต๊ะปลายทางที่ต้องการย้ายออเดอร์ทั้งหมดไป</p>
            <select
              value={moveTargetId}
              onChange={e => setMoveTargetId(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-white mb-4"
            >
              <option value="">— เลือกโต๊ะ —</option>
              {otherTables.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowMoveModal(false)} className="flex-1 border border-border py-2 rounded-xl text-sm">ยกเลิก</button>
              <button onClick={handleMoveTable} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-sm font-semibold">ยืนยันย้าย</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal แยกโต๊ะ */}
      {showSplitModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={closeAll}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">แยกโต๊ะ — {selectedTable.name}</h2>
              <button onClick={closeAll}><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-400 mb-2">เลือกรายการที่ต้องการแยกออกไป</p>
            <div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
              {allItems.map(item => (
                <label key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={splitSelectedItems.includes(item.id)}
                    onChange={() => toggleSplitItem(item.id)}
                    className="accent-primary"
                  />
                  <span className="text-sm flex-1">{item.qty}x {item.name}</span>
                  <span className="text-primary text-sm">{fmt(Number(item.price) * item.qty)}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-400 mb-2">โต๊ะปลายทาง</p>
            <select
              value={splitTargetId}
              onChange={e => setSplitTargetId(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-white mb-4"
            >
              <option value="">— เลือกโต๊ะ —</option>
              {otherTables.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowSplitModal(false)} className="flex-1 border border-border py-2 rounded-xl text-sm">ยกเลิก</button>
              <button onClick={handleSplitTable} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-xl text-sm font-semibold">ยืนยันแยก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
