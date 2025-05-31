import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../output.css";

import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";

const localizer = momentLocalizer(moment);

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [calendarView, setCalendarView] = useState("month");

  useEffect(() => {
    fetchEvents(currentDate);
  }, [selectedSubject, currentDate]);

  const fetchEvents = async (date) => {
    setLoading(true);
    setError(false);
    try {
      const start = moment(date).startOf("month").format("YYYY-MM-DD");
      const end = moment(date).endOf("month").format("YYYY-MM-DD");

      const res = await fetch(
        `http://localhost:5000/api/tasks?start=${start}&end=${end}`
      );
      const data = await res.json();

      const formatted = data
        .filter((task) => !selectedSubject || task.subject === selectedSubject)
        .map((task) => ({
          id: task.id,
          title: `${task.subject} - ${task.notes || "No notes"} (${task.progress || 0}%)`,
          start: new Date(task.task_date),
          end: moment(task.task_date).add(task.duration, "minutes").toDate(),
          progress: task.progress || 0,
        }));

      setEvents(formatted);
      const uniqueSubjects = [...new Set(data.map((task) => task.subject))];
      setSubjects(uniqueSubjects);
    } catch (err) {
      console.error(err);
      setError(true);
    }
    setLoading(false);
  };

  const getColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-400";
    return "bg-red-400";
  };

  const handleAddTaskClick = () => {
    // TODO: Implement what happens when "Add Task" clicked
    alert("Add Task clicked");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        subjects={subjects}
        onAddTaskClick={handleAddTaskClick}
      />

      <main className="p-4 max-w-6xl mx-auto w-full">
        {error ? (
          <div className="text-center text-red-500">
            <p>No tasks found.</p>
            <button
              onClick={() => fetchEvents(currentDate)}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
            >
              Retry
            </button>
          </div>
        ) : (
          <div
            style={{ height: "80vh", width: "100%" }}
            className="min-w-[700px]"
          >
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
              view={calendarView}
              onView={(view) => setCalendarView(view)}
              defaultView="month"
              views={["month", "week", "day"]}
              popup
              style={{ height: "100%", width: "100%" }}
              className="bg-white p-4 rounded shadow transition-opacity duration-200"
              components={{
                event: ({ event }) => (
                  <div
                    className={`text-white px-2 py-1 rounded ${getColor(event.progress)}`}
                    title={`Progress: ${event.progress}%`}
                    aria-label={`Event: ${event.title}, Progress: ${event.progress}%`}
                    tabIndex="0"
                  >
                    {event.title}
                  </div>
                ),
              }}
            />
          </div>
        )}
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
