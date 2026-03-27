import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PrivateRoute from './components/common/PrivateRoute'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Public pages
import HomePage from './pages/movies/HomePage'
import MovieListPage from './pages/movies/MovieListPage'
import MovieDetailPage from './pages/movies/MovieDetailPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Customer pages
import SeatMapPage from './pages/booking/SeatMapPage'
import BookingConfirmPage from './pages/booking/BookingConfirmPage'
import PaymentResultPage from './pages/booking/PaymentResultPage'
import BookingHistoryPage from './pages/booking/BookingHistoryPage'
import BookingDetailPage from './pages/booking/BookingDetailPage'
import ProfilePage from './pages/user/ProfilePage'

// Staff pages
import VerifyTicketPage from './pages/staff/VerifyTicketPage'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import ManageMoviesPage from './pages/admin/ManageMoviesPage'
import ManageCinemasPage from './pages/admin/ManageCinemasPage'
import ManageShowtimesPage from './pages/admin/ManageShowtimesPage'
import ManageUsersPage from './pages/admin/ManageUsersPage'
import ManagePromotionsPage from './pages/admin/ManagePromotionsPage'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        theme="dark"
        toastStyle={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          color: '#e2e8f0',
        }}
      />
      <Routes>
        {/* Public routes with main layout */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/movies" element={<Layout><MovieListPage /></Layout>} />
        <Route path="/movies/:id" element={<Layout><MovieDetailPage /></Layout>} />
        <Route path="/login" element={<Layout><LoginPage /></Layout>} />
        <Route path="/register" element={<Layout><RegisterPage /></Layout>} />

        {/* Customer protected routes */}
        <Route path="/showtimes/:id/seats" element={
          <PrivateRoute>
            <Layout><SeatMapPage /></Layout>
          </PrivateRoute>
        } />
        <Route path="/booking/confirm" element={
          <PrivateRoute>
            <Layout><BookingConfirmPage /></Layout>
          </PrivateRoute>
        } />
        <Route path="/payment/result" element={
          <PrivateRoute>
            <Layout><PaymentResultPage /></Layout>
          </PrivateRoute>
        } />
        <Route path="/bookings" element={
          <PrivateRoute>
            <Layout><BookingHistoryPage /></Layout>
          </PrivateRoute>
        } />
        <Route path="/bookings/:id" element={
          <PrivateRoute>
            <Layout><BookingDetailPage /></Layout>
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Layout><ProfilePage /></Layout>
          </PrivateRoute>
        } />

        {/* Staff routes */}
        <Route path="/staff/verify" element={
          <PrivateRoute allowedRoles={['STAFF', 'ADMIN']}>
            <Layout><VerifyTicketPage /></Layout>
          </PrivateRoute>
        } />

        {/* Admin routes — nested in AdminLayout */}
        <Route path="/admin" element={
          <PrivateRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="movies" element={<ManageMoviesPage />} />
          <Route path="cinemas" element={<ManageCinemasPage />} />
          <Route path="showtimes" element={<ManageShowtimesPage />} />
          <Route path="users" element={<ManageUsersPage />} />
          <Route path="promotions" element={<ManagePromotionsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Layout><div className="min-h-screen flex items-center justify-center text-dark-400">404 — Không tìm thấy trang</div></Layout>} />
      </Routes>
    </>
  )
}
