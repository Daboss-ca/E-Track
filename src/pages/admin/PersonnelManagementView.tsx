import React from 'react';
import { Search, UserPlus, Shield, UserX, CheckCircle2, Mail, Building } from 'lucide-react';
import { usePersonnelManagement, SystemUser } from '../../hooks/admin/usePersonnelManagement';
import Badge from '../../components/ui/Badge/badge';
import Button from '../../components/ui/Button/button';
import { Modal } from '../../components/ui/Modal/index';

export function PersonnelManagementView() {
  const {
    users,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    isModalOpen,
    editingUser,
    formData,
    setFormData,
    handleOpenAddModal,
    handleOpenEditModal,
    handleCloseModal,
    handleSaveUser,
    handleToggleStatus,
  } = usePersonnelManagement();

  const roleOptions = ['All', 'Admin', 'Custodian', 'Segregator', 'Faculty'];

  return (
    <div className="space-y-6">
      {/* Header Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Personnel Management</h1>
        </div>
        <Button
          variant="primary"
          size="md"
          startIcon={<UserPlus className="h-4 w-4" />}
          onClick={handleOpenAddModal}
        >
          Add New User
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200 dark:focus:bg-transparent"
          />
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {roleOptions.map((role) => {
            const isActive = roleFilter === role;
            return (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={[
                  'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                ].join(' ')}
              >
                {role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-bold">User Information</th>
                <th className="px-6 py-4 font-bold">Role & Department</th>
                <th className="px-6 py-4 font-bold">Account Status</th>
                <th className="px-6 py-4 font-bold">Last Login</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-gray-400 italic">
                    No personnel records found matching your filters.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isActive = user.status === 'Active';
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-xs">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{user.fullName}</p>
                            <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <Badge
                            variant="light"
                            size="sm"
                            color={
                              user.role === 'Admin'
                                ? 'error'
                                : user.role === 'Custodian'
                                ? 'warning'
                                : user.role === 'Segregator'
                                ? 'success'
                                : 'info'
                            }
                            startIcon={<Shield className="h-3 w-3" />}
                          >
                            {user.role}
                          </Badge>
                          <span className="block text-[11px] text-gray-400 flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {user.department}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          variant="solid"
                          size="sm"
                          color={isActive ? 'success' : 'error'}
                          startIcon={isActive ? <CheckCircle2 className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                        >
                          {user.status}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                        {user.lastLogin}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={isActive ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30' : 'text-emerald-600 hover:bg-emerald-50'}
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        className="max-w-lg p-6 m-4"
      >
        <form onSubmit={handleSaveUser} className="space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {editingUser ? 'Edit System User' : 'Register New System User'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Configure personnel credentials and role-based access control (RBAC).
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Juan Dela Cruz"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-xs text-gray-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                CvSU Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. juan.delacruz@cvsu.edu.ph"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-xs text-gray-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Assigned Role (RBAC)
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as SystemUser['role'] })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-xs text-gray-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value="Admin">Admin</option>
                  <option value="Custodian">Custodian</option>
                  <option value="Segregator">Segregator</option>
                  <option value="Faculty">Faculty</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Department / Office
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. College of Computer Studies"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-xs text-gray-800 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" size="sm" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingUser ? 'Save Changes' : 'Create User Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default PersonnelManagementView;