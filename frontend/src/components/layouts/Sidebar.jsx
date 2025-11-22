// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  X,
  Layers
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agents", href: "/agents", icon: Users },
  { name: "Shops", href: "/shops", icon: Store },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`
            fixed lg:static inset-y-0 left-0 z-50
            bg-gray-900 text-white shadow-xl lg:shadow-none
            transition-all duration-300 ease-in-out
            flex flex-col
            ${isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-20"}
        `}
      >
        {/* Header / Logo Area */}
        <div className="flex items-center h-16 px-6 border-b border-gray-800/50 bg-gray-900">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <img
                src="taja.svg"
                alt="App logo"
                className="w-20 h-20 object-contain"
              />
            </div>

            <span
              className={`text-lg font-bold tracking-wide transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0 lg:hidden"
              }`}
            >
              TAJA
            </span>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 ">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose} // Close on mobile click
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative
                ${
                  isActive
                    ? "bg-white text-gray-900 shadow-md shadow-gray-900/10"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <item.icon
                className={`flex-shrink-0 w-5 h-5 transition-colors ${
                  isOpen ? "mr-3" : "mx-auto"
                }`}
              />
              
              <span
                className={`whitespace-nowrap transition-all duration-300 ${
                  isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden lg:hidden"
                }`}
              >
                {item.name}
              </span>

              {/* Tooltip for collapsed state (Desktop only) */}
              {!isOpen && (
                <div className="hidden lg:block absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer (Optional - e.g., version number) */}
        <div className="p-4 border-t border-gray-800/50">
            <p className={`text-xs text-gray-500 text-center transition-opacity duration-300 ${!isOpen && "lg:hidden"}`}>
                v1.0.0
            </p>
        </div>
      </aside>
    </>
  );
}