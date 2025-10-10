import React from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const slots = [
  "08:00–09:00",
  "09:00–10:00",
  "10:00–11:00",
  "11:00–12:00",
  // skip 12–13
  "13:00–14:00",
  "14:00–15:00",
  "15:00–16:00",
  "16:00–17:00", // overtime
  "17:00–18:00", // overtime
];

const appointments = {
  Monday: [
    {
      slot: 0,
      title: "SWR302",
      location: "BE-320",
      status: "online",
      completed: true,
      accepted: true,
    },
  ],
  Tuesday: [
    {
      slot: 0,
      title: "FER202",
      location: "BE-C204",
      status: "offline",
      completed: false,
      accepted: false,
    },
  ],
  // Add more days...
};

const SchedulePage = () => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📅 Weekly Schedule</h1>
      <div className="grid grid-cols-8 gap-4">
        <div className="font-semibold text-gray-600">Time</div>
        {days.map((day) => (
          <div key={day} className="font-semibold text-gray-600 text-center">
            {day}
          </div>
        ))}

        {slots.map((slotTime, slotIndex) => (
          <>
            <div
              key={`time-${slotIndex}`}
              className={`py-2 px-3 font-medium text-sm ${
                slotTime.includes("16") || slotTime.includes("17")
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-white text-gray-700"
              }`}
            >
              {slotTime}
            </div>

            {days.map((day) => {
              const appointment = appointments[day]?.find((a) => a.slot === slotIndex);
              return (
                <div
                  key={`${day}-${slotIndex}`}
                  className="border rounded-md p-2 bg-white shadow-sm text-sm flex flex-col gap-1 items-start justify-start min-h-[80px]"
                >
                  {appointment ? (
                    <>
                      <div className="font-bold text-indigo-600">{appointment.title}</div>
                      <div className="text-gray-500">{appointment.location}</div>
                      <div className="flex items-center gap-1 text-xs">
                        <GlobeAltIcon className="w-4 h-4" />
                        <span>{appointment.status === "online" ? "Online" : "Offline"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {appointment.completed ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                        )}
                        <span>{appointment.completed ? "Completed" : "Pending"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {appointment.accepted ? (
                          <span className="text-green-600">Accepted</span>
                        ) : (
                          <span className="text-red-600">Rejected</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">No appointment</span>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
};

export default SchedulePage;
