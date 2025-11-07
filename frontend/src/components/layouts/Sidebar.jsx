// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Agents", href: "/agents", icon: UserGroupIcon },
  { name: "Shops", href: "/shops", icon: MapPinIcon },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
                    fixed lg:relative inset-y-0 left-0 z-50
                    transition-all duration-300 bg-gray-900 text-white
                    ${
                      isOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    }
                    ${isOpen ? "w-64" : "lg:w-20"}
                `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-800">
          <h1
            className={`
                            text-2xl font-bold transition-all duration-300
                            ${
                              isOpen
                                ? "translate-x-0 opacity-100"
                                : "lg:-translate-x-1 lg:opacity-50 lg:scale-90"
                            }
                        `}
          >
            {isOpen ? "TAJA" : "T"}
          </h1>

          {/* Close button - mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 hover:bg-gray-800 ${
                  isActive ? "bg-gray-950 text-white" : "text-gray-400"
                }`
              }
            >
              <item.icon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
              <span className={`mx-4 ${!isOpen && "lg:hidden"}`}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
