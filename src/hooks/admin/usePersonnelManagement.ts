import { useState, useMemo, useCallback } from 'react';

export interface SystemUser {
  id: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Custodian' | 'Segregator' | 'Faculty';
  department: string;
  status: 'Active' | 'Deactivated';
  lastLogin: string;
}

const mockUsers: SystemUser[] = [
  {
    id: 'user-1',
    fullName: 'Christian Arnuco',
    email: 'christian.arnuco@cvsu.edu.ph',
    role: 'Admin',
    department: 'Information Technology Office',
    status: 'Active',
    lastLogin: '2026-09-02 10:45 AM',
  },
  {
    id: 'user-2',
    fullName: 'Juan Dela Cruz',
    email: 'juan.delacruz@cvsu.edu.ph',
    role: 'Custodian',
    department: 'Property & Supply Office',
    status: 'Active',
    lastLogin: '2026-09-01 02:15 PM',
  },
  {
    id: 'user-3',
    fullName: 'Alex Mercado',
    email: 'alex.mercado@cvsu.edu.ph',
    role: 'Segregator',
    department: 'Waste Management Facility',
    status: 'Active',
    lastLogin: '2026-09-02 08:30 AM',
  },
  {
    id: 'user-4',
    fullName: 'Maria Santos',
    email: 'maria.santos@cvsu.edu.ph',
    role: 'Faculty',
    department: 'College of Computer Studies',
    status: 'Deactivated',
    lastLogin: '2026-08-15 11:00 AM',
  },
];

export function usePersonnelManagement() {
  const [users, setUsers] = useState<SystemUser[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Modal states para sa Add/Edit user
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'Segregator' as SystemUser['role'],
    department: '',
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, searchTerm]);

  const handleOpenAddModal = useCallback(() => {
    setEditingUser(null);
    setFormData({ fullName: '', email: '', role: 'Segregator', department: '' });
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((user: SystemUser) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
    });
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingUser(null);
  }, []);

  const handleSaveUser = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    if (editingUser) {
      // Update existing user
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u))
      );
    } else {
      // Add new user
      const newUser: SystemUser = {
        id: `user-${Date.now()}`,
        ...formData,
        status: 'Active',
        lastLogin: 'Never',
      };
      setUsers((prev) => [newUser, ...prev]);
    }

    handleCloseModal();
  }, [formData, editingUser, handleCloseModal]);

  const handleToggleStatus = useCallback((id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'Active' ? 'Deactivated' : 'Active' } : u
      )
    );
  }, []);

  return {
    users: filteredUsers,
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
  };
}