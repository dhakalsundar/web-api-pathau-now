'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';

export default function RegisterRoleChooser() {
  const router = useRouter();

  const roles = [
    {
      id: 'rider',
      title: '🏍️ Rider/Delivery Partner',
      description: 'Join our delivery network and start earning',
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      enabled: true,
    },
    {
      id: 'customer',
      title: '👤 Customer/User',
      description: 'Create account to book and track shipments',
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      enabled: true,
    },
    {
      id: 'admin',
      title: '🏢 Admin/Staff',
      description: 'Admin accounts are created by management',
      color: 'from-gray-400 to-gray-600',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      enabled: false,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />

      <div className="container mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Account</h1>
          <p className="text-lg text-gray-600">Choose your account type to get started</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`group ${role.enabled ? 'cursor-pointer transform transition hover:scale-105' : 'opacity-50 cursor-not-allowed'} ${role.bgColor} rounded-lg border-2 ${role.borderColor} p-8 text-center`}
              onClick={() => role.enabled && router.push(`/register/${role.id}`)}
            >
              <div className={`inline-block p-4 bg-gradient-to-br ${role.color} ${role.enabled ? 'group-hover:scale-110 transition' : ''} text-white rounded-full mb-4 text-4xl`}>
                {role.title.split(' ')[0]}
              </div>
              <h2 className={`text-2xl font-bold ${role.textColor} mb-2`}>{role.title.split(' ').slice(1).join(' ')}</h2>
              <p className="text-gray-600 mb-6">{role.description}</p>
              <button
                disabled={!role.enabled}
                className={`px-6 py-3 bg-gradient-to-r ${role.color} text-white rounded-lg font-semibold hover:shadow-lg transition w-full disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {role.enabled ? `Create ${role.title.split(' ').slice(1).join(' ')} Account` : 'Admin Only (Disabled)'}
              </button>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center mb-8 max-w-6xl mx-auto">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-4 text-gray-600">Already have an account?</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Sign in to your existing account</p>
          <Link href="/login/choose">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition">
              Sign In
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
