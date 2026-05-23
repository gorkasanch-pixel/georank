import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MerchantApp from './pages/MerchantApp'
import AdminApp from './pages/AdminApp'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/app/*"   element={<MerchantApp />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
