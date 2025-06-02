import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import './input.css';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [tab, setTab] = useState("info");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/tasks/${id}`).then((res) => {
      setTask(res.data);
      setProgress(res.data.progress);
    });
  }, [id]);

  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value);
    setProgress(newProgress);
    axios.put(`http://localhost:5000/api/tasks/${id}/progress`, { progress: newProgress });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${id}`);
        alert("Task deleted successfully");
        navigate(-1); // Go back to task list
      } catch (error) {
        alert("Failed to delete task. Please try again.");
        console.error(error);
      }
    }
  };

  if (!task)
    return (
      <p className="text-center mt-20 text-gray-500 text-lg font-semibold">
        Loading...
      </p>
    );

  return (
    <div className="p-8 min-h-screen bg-gray-50 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800">
        {task.subject}
      </h1>

      <div className="max-w-xl w-full bg-white shadow-lg rounded-lg p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-300 mb-6">
          <button
            onClick={() => setTab("info")}
            className={`flex-1 text-center py-3 font-semibold transition-colors duration-300 ${
              tab === "info"
                ? "border-b-4 border-red-500 text-red-600"
                : "text-gray-500 hover:text-red-500"
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setTab("notes")}
            className={`flex-1 text-center py-3 font-semibold transition-colors duration-300 ${
              tab === "notes"
                ? "border-b-4 border-red-500 text-red-600"
                : "text-gray-500 hover:text-red-500"
            }`}
          >
            Notes
          </button>
        </div>

        {/* Content */}
        {tab === "info" ? (
          <div className="space-y-4 text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">Duration:</span> {task.duration}{" "}
              minutes
            </p>
            <p>
              <span className="font-semibold text-gray-900">Date:</span> {task.task_date}
            </p>

            <div className="mt-6">
              <label className="block text-sm font-bold mb-1 text-gray-900" htmlFor="progressRange">
                Progress
              </label>
              <input
                id="progressRange"
                type="range"
                value={progress}
                min={0}
                max={100}
                onChange={handleProgressChange}
                className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-red-500"
              />
              <p className="text-right text-sm text-gray-600 mt-1 font-medium">{progress}%</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap">{task.notes || "No notes available."}</p>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            className="px-4 py-2 rounded bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition"
            onClick={() => alert("Edit Task - feature not implemented")}
          >
            Edit Task
          </button>
          <button
            className="px-4 py-2 rounded bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition"
            onClick={handleDelete}
          >
            Delete Task
          </button>
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-pink-600 hover:text-pink-800 transition"
          >
            &larr; Back to Tasks
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;