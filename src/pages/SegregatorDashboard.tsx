import DashboardLayout from '../components/layouts/DashboardLayout';

export default function SegregatorDashboard() {
  return (
    <DashboardLayout
      role="segregator"
      title="Segregator Dashboard"
      subtitle="Sorting and segregation activity"
      userName="Segregator User"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Items Sorted</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">146</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Pending Bins</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">07</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Compliance Rate</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">96%</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
