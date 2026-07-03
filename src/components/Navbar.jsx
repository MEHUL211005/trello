import React from 'react'
import { FaTrello } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";

const Navbar = ({search,setSearch}) => {
  return (
     <nav className="sticky top-0 z-50 h-16 bg-[#1D2125] border-b border-gray-700 flex items-center justify-between px-6">

      {/* Left */}
      <div className="flex items-center gap-2">
        <FaTrello className="text-blue-500 text-2xl" />
        <h1 className="text-xl font-bold">Trello Clone</h1>
      </div>

      {/* Center */}
      <div>
        <h2 className="text-lg font-semibold text-gray-300">
          Workspace
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5 text-2xl">
        <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search cards..."
        className="w-72 rounded-md bg-slate-800 p-2 text-white outline-none"
      />
        <IoSearch className="cursor-pointer hover:text-blue-400 transition" />

        <IoNotificationsOutline className="cursor-pointer hover:text-blue-400 transition" />

        <FaUserCircle className="cursor-pointer hover:text-blue-400 transition" />
      </div>

    </nav>
  )
}

export default Navbar