import { lazy, Suspense, useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Header from './components/Header'
import ToastProvider from './components/Toast'
const Booking = lazy(() => import('./pages/Booking'))
const Contacts = lazy(() => import('./pages/Contacts'))
import Home from './pages/Home'
const House = lazy(() => import('./pages/House'))
const Houses = lazy(() => import('./pages/Houses'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Services = lazy(() => import('./pages/Services'))

function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <ToastProvider>
      <Header />
      <main>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
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
