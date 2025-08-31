import { MainTabs } from "@/components/main-tabs"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Woerk - Supercomputer Resource Management</h1>
          <p className="text-gray-600 mt-2">Resource and data management for HPC systems</p>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <MainTabs />
      </main>
    </div>
  );
}