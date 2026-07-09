import React, { useEffect, useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const DAYS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์']
const ROLE_COLOR = {
  superadmin: 'bg-orange-600',
  manager: 'bg-blue-600',
  cashier: 'bg-green-600',
  kitchen: 'bg-yellow-600',
  bar: 'bg-purple-600'
}

function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day))
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(d, n) {
  const date = new Date(d); date.setDate(date.getDate() + n); return date
}

function fmtDate(d) { return new Date(d).toISOString().split('T')[0] }

export default function SchedulePage() {
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role === 'superadmin'
  const [weekStart, setWeekStart] = useState(getMonday(new Date()))
  const [schedules, setSchedules] = useState([])
  const [staff, setStaff] = useState([])
  const [defaultTime, setDefaultTime] = useState({ startTime: '18:00', endTime: '02:00' })
  const [showTimeSetting, setShowTimeSetting] = useState(false)

  const load = async () => {
    const res = await api.get(`/schedule?week=${fmtDate(weekStart)}`)
    setSchedules(res.data)
  }

  useEffect(() => { api.get('/staff').then(r => setStaff(r.data)) }, [])
  useEffect(() => { load() }, [weekStart])

  const toggleCell = async (staffId, date) => {
    if (!isSuperAdmin) return toast.error(`role: ${user?.role} — ไม่มีสิทธิ์`)
    const dateStr = fmtDate(date)
    const existing = schedules.find(s => s.userId === staffId && s.date.split('T')[0] === dateStr)
    if (existing) {
      await api.delete(`/schedule/${existing.id}`)
      toast.success('ลบออกแล้ว')
    } else {
      await api.post('/schedule', {
        userId: staffId,
        date: dateStr,
        startTime: defaultTime.startTime,
        endTime: defaultTime.endTime
      })
      toast.success('เพิ่มแล้ว')
    }
    load()
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = fmtDate(new Date())

  const getCell = (staffId, date) =>
    schedules.find(s => s.userId === staffId && s.date.split('T')[0] === fmtDate(date))

  // นับจำนวนวันทำงานของแต่ละคนในสัปดาห์นี้
  const countDays = (staffId) =>
    weekDays.filter(d => getCell(staffId, d)).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ตารางงาน</h1>
        <button onClick={() => setShowTimeSetting(!showTimeSetting)}
          className={`flex items-center gap-2 border border-border px-4 py-2 rounded-xl text-sm transition-colors ${isSuperAdmin ? 'hover:border-primary text-gray-400 hover:text-primary' : 'opacity-30 cursor-not-allowed text-gray-600'}`}
          disabled={!isSuperAdmin}>
          ⏰ ตั้งเวลาเริ่ม-สิ้นสุด
        </button>
      </div>

      {/* Time setting */}
      {showTimeSetting && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 flex items-center gap-4">
          <span className="text-sm text-gray-400">เวลาเริ่มต้นเมื่อกดติ๊ก:</span>
          <div className="flex items-center gap-2">
            <input type="time" value={defaultTime.startTime}
              onChange={e => setDefaultTime(f => ({ ...f, startTime: e.target.value }))}
              className="bg-bg border border-border rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary" />
            <span className="text-gray-400">—</span>
            <input type="time" value={defaultTime.endTime}
              onChange={e => setDefaultTime(f => ({ ...f, endTime: e.target.value }))}
              className="bg-bg border border-border rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary" />
          </div>
          <button onClick={() => setShowTimeSetting(false)}
            className="ml-auto text-xs bg-primary hover:bg-orange-500 text-white px-3 py-1.5 rounded-xl">บันทึก</button>
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="p-2 border border-border rounded-xl hover:border-primary text-gray-400 hover:text-primary">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium">
          {weekStart.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' — '}
          {addDays(weekStart, 6).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-2 border border-border rounded-xl hover:border-primary text-gray-400 hover:text-primary">
          <ChevronRight size={18} />
        </button>
        <button onClick={() => setWeekStart(getMonday(new Date()))}
          className="text-xs px-3 py-1.5 border border-border rounded-xl text-gray-400 hover:border-primary hover:text-primary">
          สัปดาห์นี้
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-gray-400 w-40">พนักงาน</th>
              {weekDays.map((date, i) => (
                <th key={i} className={`px-3 py-3 text-center w-24 ${fmtDate(date) === today ? 'text-primary' : 'text-gray-400'}`}>
                  <div className="font-semibold">{DAYS[i]}</div>
                  <div className="text-xs font-normal opacity-70">
                    {date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 text-center text-gray-400 w-16">รวม</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id} className="border-b border-border hover:bg-bg">
                <td className="px-4 py-3">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.role}</p>
                </td>
                {weekDays.map((date, i) => {
                  const cell = getCell(s.id, date)
                  const isToday = fmtDate(date) === today
                  return (
                    <td key={i} className={`px-2 py-2 text-center ${isToday ? 'bg-primary/5' : ''}`}>
                      <button
                        onClick={() => toggleCell(s.id, date)}
                        className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center transition-all ${
                          cell
                            ? `${ROLE_COLOR[s.role] || 'bg-gray-600'} text-white shadow-lg scale-105`
                            : isSuperAdmin
                              ? 'border-2 border-dashed border-border hover:border-primary text-transparent hover:text-gray-600'
                              : 'border-2 border-dashed border-border text-transparent cursor-not-allowed'
                        }`}
                        title={cell ? `${cell.startTime}–${cell.endTime} (คลิกเพื่อลบ)` : 'คลิกเพื่อเพิ่ม'}
                      >
                        <Check size={16} />
                      </button>
                      {cell && (
                        <p className="text-xs text-gray-500 mt-1">{cell.startTime}</p>
                      )}
                    </td>
                  )
                })}
                <td className="px-3 py-3 text-center">
                  <span className={`text-sm font-bold ${countDays(s.id) > 0 ? 'text-primary' : 'text-gray-600'}`}>
                    {countDays(s.id)}/7
                  </span>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr><td colSpan={9} className="text-center text-gray-500 py-10">ไม่มีพนักงาน</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
