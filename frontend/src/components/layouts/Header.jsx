// src/components/layout/Header.jsx
import { UserCircleIcon } from '@heroicons/react/24/outline'; // Example icon library

export default function Header({ onToggleSidebar }) {
    // In a real app, you'd get user from context or a hook
    const user = { name: 'Tunde Today', role: 'Administrator' };

    return (
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
            {/* Left side: Title and Sidebar Toggle */}
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-800">Taja Admin Dashboard</h1>
            </div>

            {/* Right side: Profile Icon */}
            <div className="relative">
                <button className="flex items-center space-x-2 text-left group">
                    <UserCircleIcon className="w-10 h-10 text-gray-500 group-hover:text-gray-900" />
                    <div className="hidden md:block">
                        <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                </button>
                {/* A dropdown or modal would appear on click */}
            </div>
        </header>
    );
}