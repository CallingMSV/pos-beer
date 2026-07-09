import React, { useEffect, useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { usePermissionsStore, PERMISSION_LABELS } from '../store/permissionsStore'

const ROLE_COLOR = { superadmin: 'text-primary', manager: 'text-blue-400', cashier: 'text-green-400', kitchen: 'text-yellow-400', bar: 'text-purple-400' }
const ROLES = ['cashier', 'kitchen', 'bar', 'manager', 'superadmin']

export default function StaffPage() {
  const { user } = useAuthStore()
  const isSuperAdmin = user?.role === 'superadmin'
  const { permissions, toggle } = usePermissionsStore()
  const [staff, setStaff] = useState([])
  const [modal, setModal] = useState(false)
  const [tab, setTab] = useState('staff')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'cashier' })
  const [resetTarget, setResetTarget] = useState(null)
  const [newPassword, setNewPassword] = useState('')

  const load = () => api.get('/staff').then(r => setStaff(r.data))
  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      await api.post('/staff', form)
      toast.success('เพิ่มพนักงานสำเร็จ'); setModal(false); load()
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  const resetPassword = async () => {
    if (!newPassword.trim()) return toast.error('กรุณาใส่รหัสผ่านใหม่')
    try {
      await api.patch(`/staff/${resetTarget.id}/reset-password`, { password: newPassword })
      toast.success(`รีเซ็ตรหัสผ่านของ ${resetTarget.name} แล้ว`)
      setResetTarget(null); setNewPassword('')
    } catch { toast.error('เกิดข้อผิดพลาด') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">พนักงาน</h1>
        {isSuperAdmin && tab === 'staff' && (
          <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-primary hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm">
            <Plus size={16} /> เพิ่มพนักงาน
          </button>
        )}
      </div>

      {isSuperAdmin && (
        <div className="flex gap-2 mb-5">
          {[['staff', 'รายชื่อพนักงาน'], ['permissions', 'สิทธิ์การใช้งาน']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-xl text-sm border transition-colors ${tab === key ? 'bg-primary border-primary text-white' : 'border-border text-gray-400 hover:border-primary hover:text-primary'}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {tab === 'staff' && (
        <>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-gray-400">
                <tr>{['ชื่อ', 'อีเมล', 'ตำแหน่ง', 'สถานะ', ''].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id} className="border-b border-border hover:bg-bg">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3 text-gray-400">{s.email}</td>
                    <td className={`px-4 py-3 font-semibold ${ROLE_COLOR[s.role] || 'text-gray-400'}`}>{s.role}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-lg ${s.isActive ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-500'}`}>{s.isActive ? 'ใช้งาน' : 'ปิด'}</span></td>
                    {isSuperAdmin && (
                      <td className="px-4 py-3">
                        <button onClick={() => { setResetTarget(s); setNewPassword('') }}
                          className="text-xs px-2 py-1 rounded-lg border border-border text-gray-400 hover:border-primary hover:text-primary transition-colors">
                          รีเซ็ตรหัสผ่าน
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isSuperAdmin && <p className="text-center text-gray-500 text-sm mt-6">เฉพาะ superadmin เท่านั้นที่สามารถจัดการพนักงานได้</p>}
        </>
      )}

      {tab === 'permissions' && isSuperAdmin && (
        <div className="bg-card border border-border rounded-xl overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-gray-400">
              <tr>
                <th className="text-left px-4 py-3">สิทธิ์</th>
                {ROLES.map(r => <th key={r} className={`px-4 py-3 text-center ${r === 'superadmin' ? 'text-primary' : ROLE_COLOR[r]}`}>{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {Object.entries(PERMISSION_LABELS).map(([action, label]) => (
                <tr key={action} className="border-b border-border hover:bg-bg">
                  <td className="px-4 py-3 text-gray-300">{label}</td>
                  {ROLES.map(role => (
                    <td key={role} className="px-4 py-3 text-center">
                      {role === 'superadmin' ? (
                        <div className="w-10 h-6 rounded-full bg-primary relative mx-auto">
                          <span className="absolute top-1 left-5 w-4 h-4 bg-white rounded-full" />
                        </div>
                      ) : (
                        <button
                          onClick={() => toggle(role, action)}
                          className={`w-10 h-6 rounded-full transition-colors relative ${permissions[role]?.[action] ? 'bg-primary' : 'bg-gray-700'}`}>
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${permissions[role]?.[action] ? 'left-5' : 'left-1'}`} />
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {resetTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-3">
            <h2 className="font-bold text-lg">รีเซ็ตรหัสผ่าน</h2>
            <p className="text-sm text-gray-400">พนักงาน: <span className="text-white">{resetTarget.name}</span></p>
            <input autoFocus type="password" placeholder="รหัสผ่านใหม่" value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && resetPassword()}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" />
            <div className="flex gap-2 pt-1">
              <button onClick={() => setResetTarget(null)} className="flex-1 border border-border rounded-xl py-2 text-sm hover:bg-border">ยกเลิก</button>
              <button onClick={resetPassword} className="flex-1 bg-primary hover:bg-orange-500 text-white rounded-xl py-2 text-sm">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {isSuperAdmin && modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm space-y-3">
            <h2 className="font-bold text-lg">เพิ่มพนักงาน</h2>
            {[['name', 'ชื่อ', 'text'], ['email', 'อีเมล', 'email'], ['password', 'รหัสผ่าน', 'password']].map(([k, l, t]) => (
              <input key={k} placeholder={l} type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" />
            ))}
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white text-sm">
              {['cashier', 'kitchen', 'bar', 'manager', 'superadmin'].map(r => <option key={r} value={r}>{r}</option>)}
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
