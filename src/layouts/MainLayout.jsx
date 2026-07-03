import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
function MainLayout() {
    const [search, setSearch] = useState("");
  return (
    <div className="min-h-screen bg-[#1D2125] text-white">
        <Navbar search={search} setSearch={setSearch} />
    
    <main>
        <Outlet />
    </main>
    </div>
  )
}

export default MainLayout