import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-950 text-white">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* TOP NAVBAR */}
        <Navbar />

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

      </div>
    </div>
  );
};

export default AppLayout;