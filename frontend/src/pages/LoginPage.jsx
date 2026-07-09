import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { Beer } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@beerpos.com')
  const [password, setPassword] = useState('password')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <Beer className="text-primary" size={32} />
          <h1 className="text-2xl font-bold text-primary">Beer POS</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">อีเมล</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">รหัสผ่าน</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-orange-500 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  )
}
