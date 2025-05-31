import { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import FocusTrap from "focus-trap-react";
import { useNavigate } from "react-router-dom";

function AddTask({ onClose = () => {} }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    subject: '',
    duration: '',
    task_date: '',
    notes: '',
    confidence_level: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.subject || !form.duration || !form.task_date) {
      toast.error("Subject, Duration, and Date are required");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/study_tasks", {
        subject: form.subject,
        duration: form.duration,
        task_date: form.task_date,
        notes: form.notes || null,
        confidence_level: form.confidence_level || null
      });

      if (response.status === 201) {
        toast.success("Task added successfully");
        setTimeout(() => {
          onClose(); // Safe to call even if not passed
          navigate("/");
        }, 1200);
      } else {
        toast.error("Failed to add task");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add task");
    }
  };

  const handleCancel = () => {
    onClose(); // Safe fallback
    navigate("/");
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-[9999]">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
      </div>

      <AnimatePresence>
        <FocusTrap>
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4 text-center">Add Study Task</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  className="w-full p-2 border rounded-md"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
                <input
                  type="number"
                  name="duration"
                  placeholder="Duration (minutes)"
                  className="w-full p-2 border rounded-md"
                  value={form.duration}
                  onChange={handleChange}
                  required
                  min="1"
                />
                <input
                  type="date"
                  name="task_date"
                  className="w-full p-2 border rounded-md"
                  value={form.task_date}
                  onChange={handleChange}
                  required
                />
                <textarea
                  name="notes"
                  placeholder="Notes"
                  className="w-full p-2 border rounded-md"
                  value={form.notes}
                  onChange={handleChange}
                />
                <input
                  type="number"
                  step="0.01"
                  name="confidence_level"
                  placeholder="Confidence Level (0-100)"
                  className="w-full p-2 border rounded-md"
                  value={form.confidence_level}
                  onChange={handleChange}
                />

                <div className="flex justify-start space-x-4 mt-4">
                  <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                  >
                    Add Task
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </FocusTrap>
      </AnimatePresence>
    </>
  );
}

export default AddTask;
