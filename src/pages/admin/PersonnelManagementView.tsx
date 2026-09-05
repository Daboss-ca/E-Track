import React from 'react';
import { Search, UserPlus, Shield, Mail, Building } from 'lucide-react';
import { usePersonnelManagement, SystemUser } from '../../hooks/admin/usePersonnelManagement';
import Badge from '../../components/ui/Badge/badge';
import Button from '../../components/ui/Button/button';
import { Modal } from '../../components/ui/Modal/index';
import { DataTable } from '../../components/ui/Table';
import type { DataTableColumn } from '../../components/ui/Table';

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

  // Columns definition para sa Personnel Management DataTable na may Dot/Pulse Status
  const columns: DataTableColumn<SystemUser>[] = [
    {
      key: 'fullName',
      header: 'User Information',
      dataType: 'identifier',
      pin: 'left',
      minWidth: '220px',
      sortable: true,
      accessor: (user) => user.fullName,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-xs shrink-0">
            {user.fullName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 dark:text-white truncate">{user.fullName}</p>
            <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              {user.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role & Department',
      dataType: 'text',
      minWidth: '180px',
      sortable: true,
      accessor: (user) => user.role,
      render: (user) => (
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
          <span className="block text-[11px] text-gray-400 flex items-center gap-1 truncate">
            <Building className="h-3 w-3 shrink-0" />
            {user.department}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      dataType: 'text',
      minWidth: '140px',
      sortable: true,
      accessor: (user) => user.status,
      render: (user) => {
        const isActive = user.status === 'Active';
        return (
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/50">
            <span className="relative flex h-2 w-2 shrink-0">
              {isActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isActive ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              ></span>
            </span>
            <span
              className={`text-xs font-semibold ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {user.status}
            </span>
          </div>
        );
      },
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      dataType: 'identifier',
      minWidth: '140px',
      sortable: true,
      accessor: (user) => user.lastLogin,
      render: (user) => (
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
          {user.lastLogin}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Personnel Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage system users, assign role-based access controls (RBAC), and oversee account statuses.
          </p>
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

      {/* Personnel DataTable Layout */}
      <DataTable
        columns={columns}
        data={users}
        getRowId={(user) => user.id}
        density="default"
        emptyMessage="No personnel records found matching your filters."
        rowActions={(user) => {
          const isActive = user.status === 'Active';
          return (
            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEditModal(user)}
              >
                Edit
              </Button>
              <div className="w-[95px] flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className={
                    isActive
                      ? 'w-full justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/40'
                      : 'w-full justify-center text-emerald-600 hover:bg-emerald-50 border-emerald-200 dark:border-emerald-900/40'
                  }
                  onClick={() => handleToggleStatus(user.id)}
                >
                  {isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          );
        }}
      />

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