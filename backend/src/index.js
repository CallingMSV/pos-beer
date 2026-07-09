const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

const authRoutes = require('./routes/auth')
const orderRoutes = require('./routes/orders')
const tableRoutes = require('./routes/tables')
const productRoutes = require('./routes/products')
const categoryRoutes = require('./routes/categories')
const customerRoutes = require('./routes/customers')
const reservationRoutes = require('./routes/reservations')
const bottleKeeperRoutes = require('./routes/bottleKeepers')
const promotionRoutes = require('./routes/promotions')
const inventoryRoutes = require('./routes/inventory')
const staffRoutes = require('./routes/staff')
const reportRoutes = require('./routes/reports')
const dashboardRoutes = require('./routes/dashboard')
const scheduleRoutes = require('./routes/schedule')
const permissionsRoutes = require('./routes/permissions')

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

app.use(cors())
app.use(express.json())

// attach io to req
app.use((req, _res, next) => { req.io = io; next() })

app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/tables', tableRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/bottle-keepers', bottleKeeperRoutes)
app.use('/api/promotions', promotionRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/permissions', permissionsRoutes)

io.on('connection', (socket) => {
  console.log('client connected:', socket.id)
  socket.on('disconnect', () => console.log('client disconnected:', socket.id))
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
