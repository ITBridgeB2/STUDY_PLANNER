import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#4ade80", "#f87171"];


const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    avgConfidence: 0,
    completionRate: 0,
    onTimeCompletion: 0,
    delayedTasks: 0,
  });

  const navigate = useNavigate();
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  // Convert to numbers in case data comes as strings or null
  const completed = Number(stats.completedTasks) || 0;
  const pending = Number(stats.pendingTasks) || 0;

  const pieData = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">📊  Study Planner Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold">Total Tasks</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.totalTasks}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold">Tasks Completed</h2>
          <p className="text-3xl font-bold text-green-500">{completed}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold">Tasks Pending</h2>
          <p className="text-3xl font-bold text-red-500">{pending}</p>
        </div>
         <div className="bg-white shadow-md rounded-lg p-4 text-center">
          <h2 className="text-lg font-semibold">Confidence Level</h2>
                    <p className="text-3xl font-bold text-red-500">{stats.avgConfidence}%</p>
                    </div>

       
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold">Efficiency</h2>
          <p className="text-sm">
            On-time:{" "}
            <span className="text-green-600 font-bold">{stats.onTimeCompletion}%</span>
          </p>
          <p className="text-sm">
            Delayed:{" "}
            <span className="text-red-600 font-bold">{stats.delayedTasks}%</span>
          </p>
        <h1 className="text-xl font-semibold mb-4 text-center">Completion Status</h1>
        
        

        <div style={{ width: "100%", height: 300 }}>

          {completed + pending > 0 ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">No task data available for pie chart</p>
          )}
        </div>
      </div>
       <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-pink-600 hover:text-pink-800 transition"
          >
            &larr; Back to Tasks
          </button>
        </div>
    </div>
  );
};

export default Dashboard;
