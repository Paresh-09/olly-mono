// app/orgs/page.tsx
import OrganizationList from "../_components/org-list";
import CreateOrganizationForm from "../_components/org-form-create";

export default function OrganizationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Your Organizations
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and organize your teams efficiently
            </p>
          </div>
          <CreateOrganizationForm />
        </div>
        <OrganizationList />
      </div>
    </div>
  );
}

