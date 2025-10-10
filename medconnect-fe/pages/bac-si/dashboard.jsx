"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebase";
import { routeConfig } from "../../config/Auth/routeConfig";
import Image from "next/image";
import { HomeIcon, ClockIcon, ChartBarIcon, CalendarIcon, UsersIcon } from "@heroicons/react/24/outline";
import Link from 'next/link';
import Loading from "../../components/ui/loading"

export default function DoctorDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activePage, setActivePage] = useState("dashboard"); // sidebar active
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard hoặc waiting-room

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const route = routeConfig["/doctor/dashboard"];
      if (!user) {
        router.push(route.redirectIfNotAuth);
        return;
      }

      const role = localStorage.getItem("userRole")?.toLowerCase();
      if (!role || !route.roles.includes(role)) {
        router.push(route.redirectIfUnauthorized);
        return;
      }

      setIsAuthorized(true);
      const currentPath = router.pathname.split("/").pop() || "dashboard";
      setActivePage(currentPath);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    router.push("/");
  };

  if (!isAuthorized)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <Loading/>
      </div>
    );

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: HomeIcon },
    { key: "analytics", label: "Analytics", icon: ChartBarIcon, path: "/doctor/analytics" },
    { key: "history", label: "History", icon: ClockIcon, path: "/doctor/history" },
    { key: "schedule", label: "Schedule", icon: CalendarIcon, path: "/doctor/schedule" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 h-full w-24 bg-white shadow-md flex flex-col items-center py-6">
        <div className="mb-8">
          <Link href="/">
            <div className="w-14 h-14 from-teal-400 to-teal-500 rounded-xl flex items-center justify-center cursor-pointer">
              <Image src="/assets/logo.svg" alt="Logo" width={60} height={60} />
            </div>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-4">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActivePage(item.key);
                if (item.key === "dashboard") setActiveTab("dashboard");
                else if (item.key === "waiting-room") setActiveTab("waiting-room");
                else if (item.path) router.push(item.path); // các page khác
              }}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                activePage === item.key
                  ? "bg-teal-100 text-teal-600"
                  : "text-gray-400 hover:text-teal-500 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-24 p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {activeTab === "dashboard" ? "Dashboard" : "Waiting Room"}
          </h1>
          {/* Tab switch */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "dashboard"
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("waiting-room")}
              className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "waiting-room"
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              Waiting Room
            </button>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-xl p-6 flex flex-col gap-4 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <ClockIcon className="w-8 h-8 text-teal-500" />
                <span className="text-sm text-gray-500">Today Appointments</span>
              </div>
              <h2 className="text-2xl font-bold">12</h2>
            </div>

            <div className="bg-white shadow rounded-xl p-6 flex flex-col gap-4 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <UsersIcon className="w-8 h-8 text-teal-500" />
                <span className="text-sm text-gray-500">Patients</span>
              </div>
              <h2 className="text-2xl font-bold">38</h2>
            </div>

            <div className="bg-white shadow rounded-xl p-6 flex flex-col gap-4 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <ChartBarIcon className="w-8 h-8 text-teal-500" />
                <span className="text-sm text-gray-500">Analytics</span>
              </div>
              <h2 className="text-2xl font-bold">View Report</h2>
            </div>
          </div>
        )}

        {activeTab === "waiting-room" && (
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Patients Waiting</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Patient Name</th>
                  <th className="px-4 py-2">Appointment Time</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">Nguyen Van A</td>
                  <td className="px-4 py-2">10:00 AM</td>
                  <td className="px-4 py-2 text-teal-600 font-semibold">Waiting</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">Tran Thi B</td>
                  <td className="px-4 py-2">10:30 AM</td>
                  <td className="px-4 py-2 text-teal-600 font-semibold">Waiting</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">Le Van C</td>
                  <td className="px-4 py-2">11:00 AM</td>
                  <td className="px-4 py-2 text-teal-600 font-semibold">Waiting</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
