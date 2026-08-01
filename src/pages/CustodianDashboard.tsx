import DashboardLayout from '../components/layouts/DashboardLayout';

export default function CustodianDashboard() {
  return (
    <DashboardLayout
      role="custodian"
      title="Custodian Dashboard"
      subtitle="Inventory and material handling overview"
      userName="Custodian User"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Assigned Areas</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">06</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Equipment Status</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">Normal</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Today's Tasks</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">14</p>
        </div>
      </div>
    </DashboardLayout>
  );
}