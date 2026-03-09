import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-5xl font-bold text-gray-900">SolarLabX</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Unified Solar PV Lab Operations Suite
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          <Link
            href="/uncertainty"
            className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold text-blue-600">Uncertainty Calculator</h2>
            <p className="text-sm text-gray-500 mt-2">ISO/IEC 17025 GUM methodology</p>
          </Link>
          <Link
            href="/sun-simulator"
            className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold text-amber-600">Sun Simulator</h2>
            <p className="text-sm text-gray-500 mt-2">IEC 60904-9 Ed.3 classification</p>
          </Link>
          <Link
            href="/chamber-config"
            className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold text-green-600">Chamber Config</h2>
            <p className="text-sm text-gray-500 mt-2">Environmental test chambers</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
