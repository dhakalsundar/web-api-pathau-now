'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

interface SidebarProps {
  items: SidebarItem[];
  userRole?: string;
  userName?: string;
}

export default function Sidebar({ items, userRole = 'ADMIN', userName = 'Admin User' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gray-900 text-white transition-all duration-300 min-h-screen flex flex-col border-r border-gray-800`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-bold">
              PN
            </div>
            <span className="font-bold text-lg">PathauNow</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white transition"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-800">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center font-bold mb-2">
            {userName[0]}
          </div>
          <p className="font-semibold text-sm">{userName}</p>
          <span className="text-xs text-amber-400 font-semibold">{userRole}</span>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition text-gray-200 hover:text-white"
            title={isCollapsed ? item.label : ''}
          >
            <span className="text-xl">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition text-white font-semibold"
        >
          <span className="text-xl">🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
