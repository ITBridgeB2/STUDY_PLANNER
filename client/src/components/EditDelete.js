// src/pages/EditTask.js
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

function formatDateToLocalYYYYMMDD(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const [task, setTask] = useState({
    subject: "",
    duration: "",
    task_date: "",
    notes: "",
    confidence_level: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get(`http://localhost:5000/api/tasks/${id}`)
      .then((res) => {
        const data = res.data;
        setTask({
          ...data,
          task_date: data.task_date ? formatDateToLocalYYYYMMDD(data.task_date) : ""
        });
      })
      .catch(() => toast.error("Failed to load task data."));
  }, [id]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        navigate("/");
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [navigate]);

  useEffect(() => {
    const focusableElements = modalRef.current?.querySelectorAll("input, textarea, button");
    const first = focusableElements?.[0];
    const last = focusableElements?.[focusableElements.length - 1];

    const trap = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });

    const updatedErrors = { ...errors };
    if (name === "subject" && value.trim() === "") {
      updatedErrors.subject = "Subject is required.";
    } else {
      delete updatedErrors.subject;
    }

    if (name === "duration" && (+value <= 0 || value === "")) {
      updatedErrors.duration = "Duration must be greater than 0.";
    } else {
      delete updatedErrors.duration;
    }

    setErrors(updatedErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const hasErrors = task.subject.trim() === "" || +task.duration <= 0;
    if (hasErrors) {
      toast.error("Please fix validation errors.");
      return;
    }

    // Send the date as YYYY-MM-DD (already formatted)
    const formattedTask = {
      ...task,
      // Just ensure it's a string and correct format
      task_date: task.task_date,
    };

    axios.put(`http://localhost:5000/api/tasks/${id}`, formattedTask)
      .then(() => {
        toast.success("Task updated successfully!", {
          autoClose: 2000,
          position: "top-center",
          onClose: () => navigate("/"),
        });
      })
      .catch(() => {
        toast.error("Failed to update task.");
      });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="editTaskHeading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
    >
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md mx-4 sm:mx-auto rounded-lg shadow-lg p-6 transform transition-all duration-300 ease-in translate-y-5 animate-slideUp"
      >
        <h2 id="editTaskHeading" className="text-2xl font-bold mb-4 text-center">
          Edit Task
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              aria-label="Subject"
              type="text"
              name="subject"
              placeholder="Subject"
              value={task.subject}
              onChange={handleChange}
              className={`w-full border px-3 py-2 rounded ${errors.subject ? "border-red-500" : ""}`}
              required
            />
            {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
          </div>
          <div>
            <input
              aria-label="Duration in minutes"
              type="number"
              name="duration"
              placeholder="Duration (mins)"
              value={task.duration}
              onChange={handleChange}
              className={`w-full border px-3 py-2 rounded ${errors.duration ? "border-red-500" : ""}`}
              required
            />
            {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
          </div>
          <div>
            <input
              aria-label="Task Date"
              type="date"
              name="task_date"
              value={task.task_date || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <textarea
              aria-label="Notes"
              name="notes"
              placeholder="Notes"
              value={task.notes}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <input
              aria-label="Confidence Level"
              type="number"
              name="confidence_level"
              placeholder="Confidence Level (0-100)"
              value={task.confidence_level}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Update
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
}