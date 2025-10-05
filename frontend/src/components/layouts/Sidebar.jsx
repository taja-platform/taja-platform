// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { HomeIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Agents', href: '/agents', icon: UserGroupIcon },
    { name: 'Shops', href: '/shops', icon: MapPinIcon },
];

export default function Sidebar({ isOpen }) {
    return (
        <aside className={`transition-all duration-300 bg-gray-900 text-white ${isOpen ? 'w-64' : 'w-20'}`}>
            <div className="flex items-center justify-center h-20 border-b border-gray-800">
                {/* Your Logo Here */}
                <h1 
                    className={`
                        text-2xl font-bold transition-all duration-300
                        ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-50 scale-90'}
                    `}
                >
                    {isOpen ? 'TAJA' : 'T'}
                </h1>
            </div>
            <nav className="mt-6">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            `flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 hover:bg-gray-800 ${
                                isActive ? 'bg-gray-950 text-white' : 'text-gray-400'
                            }`
                        }
                    >
                        <item.icon className="h-6 w-6" aria-hidden="true" />
                        <span className={`mx-4 ${!isOpen && 'hidden'}`}>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}