import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import POSPage from './pages/POSPage'
import FloorPlanPage from './pages/FloorPlanPage'
import KitchenPage from './pages/KitchenPage'
import BarDisplayPage from './pages/BarDisplayPage'
import ProductsPage from './pages/ProductsPage'
import InventoryPage from './pages/InventoryPage'
import CustomersPage from './pages/CustomersPage'
import ReservationsPage from './pages/ReservationsPage'
import BottleKeeperPage from './pages/BottleKeeperPage'
import PromotionsPage from './pages/PromotionsPage'
import StaffPage from './pages/StaffPage'
import ReportsPage from './pages/ReportsPage'
import SchedulePage from './pages/SchedulePage'

function PrivateRoute({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1C1C2B', color: '#fff', border: '1px solid #2A2A3A' } }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/kitchen" element={<PrivateRoute><KitchenPage /></PrivateRoute>} />
        <Route path="/bar" element={<PrivateRoute><BarDisplayPage /></PrivateRoute>} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="floor" element={<FloorPlanPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="reservations" element={<ReservationsPage />} />
          <Route path="bottle-keeper" element={<BottleKeeperPage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
