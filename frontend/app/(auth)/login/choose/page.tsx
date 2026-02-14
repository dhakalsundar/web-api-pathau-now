'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

export default function LoginRoleChooser() {
  const router = useRouter();

  const roles = [
    {
      id: 'admin',
      title: '🏢 Admin/Staff',
      description: 'Manage operations, users, and shipments',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 'rider',
      title: '🏍️ Rider/Delivery Partner',
      description: 'View and manage your assigned deliveries',
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      id: 'customer',
      title: '👤 Customer/User',
      description: 'Book parcels and track shipments',
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />

      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Account Type</h1>
          <p className="text-lg text-gray-600">Select how you want to access PathauNow</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`group cursor-pointer transform transition hover:scale-105 ${role.bgColor} rounded-lg border-2 ${role.borderColor} p-8 text-center`}
              onClick={() => router.push(`/login/${role.id}`)}
            >
              <div className={`inline-block p-4 bg-gradient-to-br ${role.color} text-white rounded-full mb-4 text-4xl group-hover:scale-110 transition`}>
                {role.title.split(' ')[0]}
              </div>
              <h2 className={`text-2xl font-bold ${role.textColor} mb-2`}>{role.title.split(' ').slice(1).join(' ')}</h2>
              <p className="text-gray-600 mb-6">{role.description}</p>
              <button
                className={`px-6 py-3 bg-gradient-to-r ${role.color} text-white rounded-lg font-semibold hover:shadow-lg transition w-full`}
              >
                Login as {role.title.split(' ').slice(1).join(' ')}
              </button>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center mb-8 max-w-6xl mx-auto">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-4 text-gray-600">Don't have an account?</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Create a new account instead</p>
          <Link href="/register/choose">
            <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:shadow-lg transition">
              Create New Account
            </button>
          </Link>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link href="/" className="text-gray-600 hover:text-gray-900 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
