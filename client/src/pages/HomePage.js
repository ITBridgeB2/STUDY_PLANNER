import React, { useEffect, useState, useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css"; // 1. Import first
import "../output.css"; // Your Tailwind CSS (import AFTER calendar css)

import { Button } from "../components/ui/button";
import { Toaster } from "react-hot-toast";
import { data, useNavigate } from "react-router-dom";


const localizer = momentLocalizer(moment);

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [calendarView, setCalendarView] = useState("month");

  const navigate=useNavigate()

  useEffect(() => {
    fetchEvents(currentDate);
  }, [selectedSubject, currentDate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

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
    if (progress >= 100) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-400";
    return "bg-red-400";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="flex items-center justify-between bg-red-500 text-white px-6 py-4 shadow">
        <h1 className="text-2xl font-bold">Study Planner</h1>
        <div className="relative space-x-4 flex items-center">
          <Button className="bg-white text-red-500 hover:bg-red-100"   onClick={() => navigate("/dashboard")}>Dashboard</Button>

          <div className="relative dropdown-container" ref={dropdownRef}>
            <Button
              className="bg-white text-red-500 hover:bg-red-100"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {selectedSubject || "All Subjects"} ▼
            </Button>
            {dropdownOpen && (
              <div className="absolute z-10 mt-2 bg-white text-black rounded shadow-md py-1 w-40">
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedSubject("");
                    setDropdownOpen(false);
                  }}
                >
                  All Subjects
                </div>
                {subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedSubject(subject);
                      setDropdownOpen(false);
                    }}
                  >
                    {subject}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button className="bg-white text-red-500 hover:bg-red-100" onClick={() => navigate("/add")}>Add Task</Button>
        </div>
      </nav>

      <main className="p-4 max-w-6xl mx-auto w-full">
        {error ? (
          <div className="text-center text-red-500">
            <p>No tasks found.</p>
            <Button onClick={() => fetchEvents(currentDate)} className="mt-2">
              Retry
            </Button>
          </div>
        ) : (
          <div
            style={{ height: "80vh", width: "100%" }}
            // 3. Make sure calendar container has minWidth for day/week
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
                onSelectEvent={(event) => navigate(`/viewDetails/${event.id}`)}

              components={{
  event: ({ event }) => {
    const [subject, ...rest] = event.title.split(" - ");
    const restText = rest.join(" - ");

    return (
      <div
        className={`px-1 py-0.5 text-xs rounded ${getColor(event.progress)}`}
        style={{
          lineHeight: "1.1",
          fontSize: "0.7rem",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          minHeight: "1.5em", // helps force a bit of space
        }}
         title={event.title} 
      >
        
        <span className="font-semibold text-white" >{event.id} {subject}</span>
        {restText && <span className="text-white"> - {restText}</span>}
      </div>
    );
  },
}}

            />
          </div>
        )}
      </main>

      <Toaster position="top-right" />
    </div>
  );
}