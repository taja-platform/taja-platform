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
        <aside 
            className={`
                relative transition-all duration-300 ease-in-out bg-gray-900 text-white
                ${isOpen ? 'w-64' : 'w-20'}
            `}
        >
            {/* Logo Section */}
            <div className="flex items-center justify-center h-20 border-b border-gray-800 transition-all duration-300">
                <h1 
                    className={`
                        text-2xl font-bold transition-all duration-300
                        ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-50 scale-90'}
                    `}
                >
                    {isOpen ? 'TAJA' : 'T'}
                </h1>
            </div>

            {/* Navigation */}
            <nav className="mt-6 space-y-1">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            `group flex items-center transition-all duration-200 ease-in-out hover:bg-gray-800 rounded-lg ${
                                isActive 
                                    ? 'bg-gray-950 text-white shadow-inner' 
                                    : 'text-gray-400 hover:text-white'
                            } ${isOpen ? 'pl-6 pr-4 py-3 justify-start' : 'p-3 justify-center'}`
                        }
                    >
                        <item.icon 
                            className={`
                                h-6 w-6 transition-transform duration-200
                                ${isOpen ? 'mr-4' : 'mx-auto'}
                                group-hover:scale-110
                            `} 
                            aria-hidden="true" 
                        />
                        <span 
                            className={`
                                text-sm font-medium ml-0 transition-all duration-200 ease-in-out
                                ${isOpen 
                                    ? 'translate-x-0 opacity-100 scale-100 delay-100' 
                                    : 'translate-x-4 opacity-0 scale-75 -ml-8'
                                }
                            `}
                        >
                            {item.name}
                        </span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}