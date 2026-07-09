# 🍺 Beer POS Premium

ระบบ POS สำหรับร้านเบียร์ — Full Stack Web App

## Stack
- **Frontend**: React + Vite + TailwindCSS + Zustand + Socket.IO
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL
- **Container**: Docker + Docker Compose

## โครงสร้างไฟล์
```
beer pos/
├── docker-compose.yml       # รวมทุก service
├── database/
│   └── init.sql             # Schema + seed data
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma    # Prisma ORM schema
│   └── src/
│       ├── index.js         # Entry point + Socket.IO
│       ├── prisma.js        # Prisma client
│       ├── middleware/
│       │   └── auth.js      # JWT middleware
│       └── routes/
│           ├── auth.js
│           ├── orders.js
│           ├── tables.js
│           ├── products.js
│           ├── categories.js
│           ├── customers.js
│           ├── reservations.js
│           ├── bottleKeepers.js
│           ├── promotions.js
│           ├── inventory.js
│           ├── staff.js
│           ├── reports.js
│           └── dashboard.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── api/index.js     # Axios instance
        ├── store/
        │   └── authStore.js # Zustand auth store
        ├── components/
        │   └── Layout.jsx   # Sidebar layout
        └── pages/
            ├── LoginPage.jsx
            ├── DashboardPage.jsx
            ├── POSPage.jsx
            ├── FloorPlanPage.jsx
            ├── KitchenPage.jsx
            ├── BarDisplayPage.jsx
            ├── ProductsPage.jsx
            ├── InventoryPage.jsx
            ├── CustomersPage.jsx
            ├── ReservationsPage.jsx
            ├── BottleKeeperPage.jsx
            ├── PromotionsPage.jsx
            ├── StaffPage.jsx
            └── ReportsPage.jsx
```

## วิธีรัน

### ด้วย Docker (แนะนำ)
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Database: localhost:5432

### Login เริ่มต้น
- Email: `admin@beerpos.com`
- Password: `password`

### รัน Dev (ไม่ใช้ Docker)
```bash
# Backend
cd backend
npm install
npx prisma generate
node src/index.js

# Frontend
cd frontend
npm install
npm run dev
```

## Modules
| Module | URL |
|--------|-----|
| Dashboard | / |
| POS | /pos |
| Floor Plan | /floor |
| Kitchen Display | /kitchen |
| Bar Display | /bar |
| สินค้า | /products |
| Inventory | /inventory |
| ลูกค้า | /customers |
| การจอง | /reservations |
| Bottle Keeper | /bottle-keeper |
| โปรโมชัน | /promotions |
| พนักงาน | /staff |
| รายงาน | /reports |

## Design
- Primary: `#FF7050`
- Background: `#14141F`
- Card: `#1C1C2B`
- Border: `#2A2A3A`
- Font: Prompt
