import DashboardLayout from '../components/layouts/DashboardLayout';

export default function AdminDashboard() {
  return (
    <DashboardLayout
      role="admin"
      title="Admin Dashboard"
      subtitle="System overview and administrative tools"
      userName="Admin User"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Active Users</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">128</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Pending Requests</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">18</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Reports</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">24</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
