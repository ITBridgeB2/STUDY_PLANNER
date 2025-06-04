import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import AddTask from './components/AddTask';
import TaskDetails from './pages/ViewTaskDetails';
import EditTask from './components/EditDelete';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element ={<Dashboard/>}/>
        <Route path="/add" element={<AddTask/>}/>
        <Route path="/viewDetails/:id" element={<TaskDetails/>}/>
        <Route path='/editDetails/:id' element={<EditTask/>}/>
      </Routes>
    </Router>
  );
}

export default App;