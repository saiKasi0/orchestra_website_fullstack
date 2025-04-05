import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function SettingsPage() {
  return (
    <AdminPageLayout allowedRoles={["admin", "super_admin"]} title="Site Settings">
      <div className="space-y-6">
        {/* Add your site settings components here */}
      </div>
    </AdminPageLayout>
  );
}