import DashboardLayout from '../components/layouts/DashboardLayout';

export default function OfficeStaffDashboard() {
  return (
    <DashboardLayout
      role="officeStaff"
      title="Office Staff Dashboard"
      subtitle="Internal requests and processing queue"
      userName="Office Staff User"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Open Requests</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">11</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Pending Approvals</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">05</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Processed Today</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">26</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
