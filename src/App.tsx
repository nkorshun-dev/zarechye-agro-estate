import { useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import ToastProvider from './components/Toast'
import Booking from './pages/Booking'
import Contacts from './pages/Contacts'
import Home from './pages/Home'
import House from './pages/House'
import Houses from './pages/Houses'
import NotFound from './pages/NotFound'
import Services from './pages/Services'

function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <ToastProvider>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </ToastProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="houses" element={<Houses />} />
        <Route path="houses/:slug" element={<House />} />
        <Route path="booking" element={<Booking />} />
        <Route path="services" element={<Services />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
