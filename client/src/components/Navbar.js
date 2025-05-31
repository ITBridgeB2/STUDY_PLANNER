// src/components/Navbar.js
import React, { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";

export default function Navbar({ 
  selectedSubject, 
  setSelectedSubject, 
  subjects, 
  onAddTaskClick,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  return (
    <nav className="flex items-center justify-between bg-red-500 text-white px-6 py-4 shadow">
      <h1 className="text-2xl font-bold">Study Planner</h1>
      <div className="relative space-x-4 flex items-center">
        <Button className="bg-white text-red-500 hover:bg-red-100">Dashboard</Button>

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

        <Button
          className="bg-white text-red-500 hover:bg-red-100"
          onClick={onAddTaskClick}
        >
          Add Task
        </Button>
      </div>
    </nav>
  );
}
