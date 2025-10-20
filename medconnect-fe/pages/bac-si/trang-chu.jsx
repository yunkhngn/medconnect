import React, { useState } from 'react'
import DoctorFrame from '@/components/layouts/Doctor/Frame'
import { Video, Info, Copy, ChevronDown, HelpCircle } from 'lucide-react'

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last week')

  const callsData = [
    { day: 'Mon', calls: 8 },
    { day: 'Tue', calls: 12 },
    { day: 'Wed', calls: 6 },
    { day: 'Thu', calls: 15 },
    { day: 'Fri', calls: 10 },
    { day: 'Sat', calls: 4 },
    { day: 'Sun', calls: 3 }
  ]

  const maxCalls = Math.max(...callsData.map(d => d.calls))

  return (
    <DoctorFrame title="Trang chủ">
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 p-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Waiting Room</h2>
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">1</span>
            </div>
          </div>

          {/* Patient Info Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
                  alt="Patient"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Jamie Otteson</h4>
                  <p className="text-sm text-gray-500">Waiting for 6 min</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={18} className="text-gray-700" />
                  <h3 className="font-semibold text-gray-900">Patient Information</h3>
                </div>
              </div>

              <button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Video size={18} />
                Start video call
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome Dr. John,</h1>
              <p className="text-gray-600 mb-8">To invite someone to your room, simply share this link:</p>

              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="flex-1 max-w-md bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-600">
                  medconnect/john
                </div>
                <button className="bg-teal-500 hover:bg-teal-600 text-white font-medium px-4 py-3 rounded-lg flex items-center gap-2 transition-colors">
                  <Copy size={18} />
                  Copy link
                </button>
                <div className="relative">
                  <button className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-4 py-3 rounded-lg flex items-center gap-2 transition-colors">
                    Invite via
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Number of calls</h2>
                <div className="relative">
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                    {selectedPeriod}
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-end justify-between h-64 gap-4">
                  {callsData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            data.calls === maxCalls ? 'bg-teal-600' : 'bg-teal-400'
                          }`}
                          style={{ height: `${(data.calls / maxCalls) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{data.day}</span>
                      <span className="text-xs text-gray-400">{data.calls}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Help Button */}
          <button className="fixed bottom-8 right-8 w-14 h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
            <HelpCircle size={24} />
          </button>
        </div>
      </div>
    </DoctorFrame>
  )
}

export default Dashboard
