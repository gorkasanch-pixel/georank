import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MerchantApp from './pages/MerchantApp'
import AdminApp from './pages/AdminApp'
import GbpCallback from './pages/GbpCallback'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*"      element={<MerchantApp />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/app/gbp-callback" element={<GbpCallback />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
