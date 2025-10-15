import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const Documentation_Layout = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Navbar />
      </div>

      {/* Main section (below navbar) */}
      <div className="flex flex-1 pt-20">
        {/* Fixed Sidebar */}
        <div className="fixed top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-white shadow-md z-20">
          <Sidebar />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 ml-64 overflow-y-auto bg-[#F9FAFB] ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Documentation_Layout;
