'use client';

/**
 * EXAMPLES FOR withRoleProtection HOC
 * 
 * This file shows common usage patterns.
 * Copy patterns to your own page.tsx files.
 */

import { withRoleProtection, withAdminProtection, withRiderProtection, withCustomerProtection, withAuthProtection } from '@/app/hoc/withRoleProtection';
import { useAuth } from '@/app/context/AuthContext';


function AdminDashboard() {
  const { user, role } = useAuth();

  return (
    <div className="p-8 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome, <span className="font-semibold">{user?.email}</span>
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <p className="text-gray-600 text-sm font-semibold mb-2">TOTAL USERS</p>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <p className="text-gray-600 text-sm font-semibold mb-2">SHIPMENTS</p>
          <p className="text-3xl font-bold text-green-600">5,678</p>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <p className="text-gray-600 text-sm font-semibold mb-2">ACTIVE RIDERS</p>
          <p className="text-3xl font-bold text-orange-600">89</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          This page is protected for <strong>ADMIN</strong> role only.
          If another user visits, they'll be redirected to home.
        </p>
      </div>
    </div>
  );
}

export const AdminDashboardExample = withAdminProtection(AdminDashboard);


function RiderDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-8 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-4">Rider Dashboard</h1>
      <p className="text-gray-600 mb-6">Ready to deliver, {user?.firstName}?</p>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <p className="text-gray-600 text-sm font-semibold">ASSIGNED SHIPMENTS</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">12</p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <p className="text-gray-600 text-sm font-semibold">DELIVERED TODAY</p>
          <p className="text-4xl font-bold text-green-600 mt-2">8</p>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-lg border border-amber-200">
          <p className="text-gray-600 text-sm font-semibold">EARNINGS TODAY</p>
          <p className="text-4xl font-bold text-amber-600 mt-2">Rs 2,400</p>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-purple-800">
          This page is protected for <strong>RIDER</strong> role only.
        </p>
      </div>
    </div>
  );
}

export const RiderDashboardExample = withRiderProtection(RiderDashboard);


function UserProfile() {
  const { user, logout } = useAuth();

  return (
    <div className="p-8 bg-white rounded-lg shadow max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <p className="px-4 py-2 bg-gray-50 rounded border border-gray-200">
            {user?.email}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
            <p className="px-4 py-2 bg-gray-50 rounded border border-gray-200">
              {user?.firstName || 'Not set'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
            <p className="px-4 py-2 bg-gray-50 rounded border border-gray-200">
              {user?.lastName || 'Not set'}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
          <p className="px-4 py-2 bg-gray-50 rounded border border-gray-200">
            {user?.phoneNumber || 'Not set'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
          <p className="px-4 py-2 bg-gray-50 rounded border border-gray-200 font-semibold text-amber-600">
            {user?.role}
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-green-800">
           This page is protected for any <strong>authenticated user</strong>.
          Works for ADMIN, RIDER, CUSTOMER, STAFF roles.
        </p>
      </div>
    </div>
  );
}

export const UserProfileExample = withAuthProtection(UserProfile);


function ReportsPage() {
  const { user, role } = useAuth();

  // Both ADMIN and STAFF can view this component
  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'STAFF';

  return (
    <div className="p-8 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-4">Reports</h1>

      {isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 font-semibold"> Admin Features</p>
          <ul className="text-blue-700 text-sm mt-2">
            <li>✓ View all system analytics</li>
            <li>✓ Download raw data</li>
            <li>✓ Manage user permissions</li>
          </ul>
        </div>
      )}

      {isStaff && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <p className="text-purple-800 font-semibold"> Staff Features</p>
          <ul className="text-purple-700 text-sm mt-2">
            <li>✓ View assigned reports</li>
            <li>✓ Generate monthly summaries</li>
          </ul>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          This page allows both <strong>ADMIN</strong> and <strong>STAFF</strong> roles.
          Non-matching roles get redirected to home.
        </p>
      </div>
    </div>
  );
}

export const ReportsPageExample = withRoleProtection(ReportsPage, {
  allowedRoles: ['ADMIN', 'STAFF'],
  redirectTo: '/', // Default but explicit
});


function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect handled by logout() via AuthContext
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}

// This doesn't need protection - it just needs useAuth
export const LogoutButtonComponent = LogoutButton;


/**
 * USAGE IN: app/admin/dashboard/page.tsx
 * 
 * 'use client';
 * 
 * import { withAdminProtection } from '@/app/hoc/withRoleProtection';
 * import { useAuth } from '@/app/context/AuthContext';
 * 
 * function AdminDashboard() {
 *   const { user } = useAuth();
 *   
 *   return (
 *     <div>
 *       <h1>Admin Dashboard</h1>
 *       <p>Welcome, {user?.email}</p>
 *     </div>
 *   );
 * }
 * 
 * export default withAdminProtection(AdminDashboard);
 */

/**
 * USAGE IN: app/rider/dashboard/page.tsx
 * 
 * 'use client';
 * 
 * import { withRiderProtection } from '@/app/hoc/withRoleProtection';
 * 
 * function RiderDashboard() {
 *   return <div>Rider Dashboard</div>;
 * }
 * 
 * export default withRiderProtection(RiderDashboard);
 */

/**
 * USAGE IN: app/profile/page.tsx
 * 
 * 'use client';
 * 
 * import { withAuthProtection } from '@/app/hoc/withRoleProtection';
 * 
 * function ProfilePage() {
 *   return <div>My Profile</div>;
 * }
 * 
 * export default withAuthProtection(ProfilePage);
 */

/**
 * USAGE IN: app/reports/page.tsx
 * 
 * 'use client';
 * 
 * import { withRoleProtection } from '@/app/hoc/withRoleProtection';
 * 
 * function ReportsPage() {
 *   return <div>Reports</div>;
 * }
 * 
 * export default withRoleProtection(ReportsPage, {
 *   allowedRoles: ['ADMIN', 'STAFF'],
 * });
 */
