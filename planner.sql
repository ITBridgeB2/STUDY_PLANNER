CREATE DATABASE study_planner;
use study_planner;

CREATE TABLE study_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  duration INT NOT NULL,
  task_date DATE NOT NULL,
  notes TEXT NULL,
  confidence_level DECIMAL(5,2) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE task_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  progress INT NOT NULL COMMENT 'Progress percentage 0-100',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES study_tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO study_tasks (subject, duration, task_date, notes, confidence_level)
VALUES 
  ('Math', 60, '2025-06-01', 'Calculus practice', 85.5),
  ('Science', 45, '2025-06-02', 'Physics revision', 78.2),
  ('English', 30, '2025-06-01', 'Essay writing', 90.0),
  ('History', 60, '2025-06-03', 'WWII notes', 70.0),
  ('Math', 90, '2025-06-04', 'Integration techniques', 88.0),
  ('Science', 30, '2025-06-01', 'Lab report', 65.0);
  
  
  INSERT INTO study_tasks (subject, duration, task_date, notes, confidence_level)
VALUES
  ('Math', 30, '2025-06-05', 'Probability formulas', 75.0),
  ('English', 45, '2025-06-06', 'Poetry analysis', 80.0),
  ('Science', 60, '2025-06-05', 'Chemistry equations', 72.5),
  ('History', 30, '2025-06-07', 'Cold War timeline', 68.0),
  ('Geography', 45, '2025-06-08', 'Maps and regions', 82.0),
  ('Math', 60, '2025-06-09', 'Coordinate geometry', 77.0),
  ('English', 30, '2025-06-10', 'Grammar practice', 85.0),
  ('Science', 90, '2025-06-11', 'Biology cell structure', 88.5),
  ('History', 60, '2025-06-12', 'Independence movements', 69.0),
  ('Math', 45, '2025-06-13', 'Algebraic equations', 74.0),
  ('English', 60, '2025-06-14', 'Comprehension skills', 91.0),
  ('Science', 30, '2025-06-15', 'Physics numericals', 70.0),
  ('History', 90, '2025-06-16', 'World War I causes', 67.5),
  ('Math', 30, '2025-06-17', 'Quick revision of formulas', 80.0),
  ('Geography', 60, '2025-06-18', 'Climate and weather', 83.0),
  ('Science', 60, '2025-06-19', 'Human anatomy', 79.0),
  ('English', 45, '2025-06-20', 'Speech writing', 86.0),
  ('History', 30, '2025-06-21', 'Nationalism in Europe', 71.0),
  ('Math', 90, '2025-06-22', 'Mock test', 92.0),
  ('Science', 45, '2025-06-23', 'Electric circuits', 76.0),
  ('English', 30, '2025-06-24', 'Synonyms and antonyms', 89.0),
  ('Geography', 45, '2025-06-25', 'Natural resources', 78.5),
  ('History', 60, '2025-06-26', 'French Revolution', 73.0),
  ('Math', 60, '2025-06-27', 'Trigonometry review', 84.0),
  ('Science', 30, '2025-06-28', 'Periodic table', 81.0);


SELECT  * FROM study_tasks;
