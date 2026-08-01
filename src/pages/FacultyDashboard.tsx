import DashboardLayout from '../components/layouts/DashboardLayout';

export default function FacultyDashboard() {
  return (
    <DashboardLayout
      role="faculty"
      title="Faculty Dashboard"
      subtitle="Teaching and request overview"
      userName="Faculty User"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Assigned Classes</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">09</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Active Requests</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">04</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Notifications</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">12</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
