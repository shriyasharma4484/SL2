import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Shriya@26',
  database: process.env.DB_NAME || 'sevadeep_civicconnect',
  multipleStatements: true
};

export async function initCivicOpsDatabase() {
  const connection = await mysql.createConnection(dbConfig);
  console.log('[CivicOps Init] Connected to MySQL...');

  const schema = `
    CREATE TABLE IF NOT EXISTS civicops_volunteers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      phone VARCHAR(20) NULL,
      area VARCHAR(100) NOT NULL,
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      primary_skill VARCHAR(100) NOT NULL,
      secondary_skills JSON NULL,
      max_travel_km DECIMAL(4, 1) DEFAULT 10.0,
      vehicle_type ENUM('None (Walking/Transit)', 'Two-Wheeler', 'Car/Van') DEFAULT 'Two-Wheeler',
      time_slot ENUM('Morning (07:00 - 11:00)', 'Afternoon (14:00 - 18:00)', 'Full Day') DEFAULT 'Morning (07:00 - 11:00)',
      past_assignments_count INT DEFAULT 0,
      is_available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS civicops_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      category VARCHAR(100) NOT NULL,
      area VARCHAR(100) NOT NULL,
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'High',
      priority_weight INT DEFAULT 4,
      required_skill VARCHAR(100) NOT NULL,
      min_volunteers INT DEFAULT 2,
      max_volunteers INT DEFAULT 4,
      time_window VARCHAR(50) DEFAULT 'Morning (07:30 - 10:30)',
      equipment_needed VARCHAR(255) NULL,
      status ENUM('Pending Assignment', 'Assigned', 'In Progress', 'Completed', 'Uncovered') DEFAULT 'Pending Assignment',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS civicops_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      plan_code VARCHAR(50) NOT NULL,
      strategy ENUM('balanced', 'travel_minimization', 'priority_maximization') DEFAULT 'balanced',
      total_volunteers_available INT NOT NULL,
      total_tasks_considered INT NOT NULL,
      tasks_covered INT NOT NULL,
      tasks_uncovered INT NOT NULL,
      avg_travel_distance_km DECIMAL(5, 2) DEFAULT 0,
      skill_match_percentage DECIMAL(5, 2) DEFAULT 0,
      high_priority_coverage_pct DECIMAL(5, 2) DEFAULT 0,
      workload_fairness_pct DECIMAL(5, 2) DEFAULT 0,
      is_approved BOOLEAN DEFAULT FALSE,
      approved_by_id INT NULL,
      approved_at TIMESTAMP NULL,
      plan_snapshot JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS civicops_plan_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      plan_id INT NOT NULL,
      volunteer_id INT NOT NULL,
      task_id INT NOT NULL,
      role_in_team ENUM('Team Lead', 'Skill Specialist', 'Field Support') DEFAULT 'Field Support',
      distance_km DECIMAL(5, 2) NOT NULL,
      skill_match_score DECIMAL(5, 2) DEFAULT 80.0,
      FOREIGN KEY (plan_id) REFERENCES civicops_plans(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  await connection.query(schema);
  console.log('[CivicOps Init] Tables verified.');

  // Check if volunteers seeded
  const [volCount] = await connection.query('SELECT COUNT(*) AS count FROM civicops_volunteers');
  if (volCount[0].count === 0) {
    console.log('[CivicOps Init] Seeding 15 realistic Pune volunteers...');
    const volunteers = [
      ['Aarav Kulkarni', 'aarav.civic@sevadeep.org', '9822011001', 'Kothrud', 18.5074, 73.8077, 'Community Coordination / Lead', JSON.stringify(['Cleanup & Heavy Lifting', 'First Aid']), 12.0, 'Two-Wheeler', 'Morning (07:00 - 11:00)', 8],
      ['Priya Patil', 'priya.civic@sevadeep.org', '9822011002', 'Deccan Gymkhana', 18.5173, 73.8415, 'Tree Plantation & Agro', JSON.stringify(['Field Documentation', 'First Aid']), 8.0, 'Two-Wheeler', 'Morning (07:00 - 11:00)', 5],
      ['Rohan Shinde', 'rohan.civic@sevadeep.org', '9822011003', 'Swargate', 18.5018, 73.8636, 'Cleanup & Heavy Lifting', JSON.stringify(['Waste Segregation']), 10.0, 'Two-Wheeler', 'Morning (07:00 - 11:00)', 12],
      ['Neha Deshpande', 'neha.civic@sevadeep.org', '9822011004', 'Shivajinagar', 18.5308, 73.8475, 'Field Documentation / Photography', JSON.stringify(['Social Media', 'Community Coordination']), 15.0, 'Car/Van', 'Morning (07:00 - 11:00)', 3],
      ['Aditya Joshi', 'aditya.civic@sevadeep.org', '9822011005', 'Aundh', 18.5580, 73.8075, 'Tree Plantation & Agro', JSON.stringify(['Botanical Survey']), 10.0, 'Two-Wheeler', 'Morning (07:00 - 11:00)', 7],
      ['Tanvi Kulkarni', 'tanvi.civic@sevadeep.org', '9822011006', 'Hadapsar', 18.5089, 73.9259, 'Waste Segregation Specialist', JSON.stringify(['Cleanup & Heavy Lifting']), 8.0, 'Two-Wheeler', 'Morning (07:00 - 11:00)', 4],
      ['Siddharth Gaikwad', 'siddharth.civic@sevadeep.org', '9822011007', 'Kasba Peth', 18.5196, 73.8553, 'Community Coordination / Lead', JSON.stringify(['Volunteer Management']), 6.0, 'None (Walking/Transit)', 'Morning (07:00 - 11:00)', 14],
      ['Ananya Deshmukh', 'ananya.civic@sevadeep.org', '9822011008', 'Kothrud', 18.5034, 73.8120, 'First Aid & Safety', JSON.stringify(['Field Support']), 10.0, 'Two-Wheeler', 'Morning (07:00 - 11:00)', 6],
      ['Omkar Jadhav', 'omkar.civic@sevadeep.org', '9822011009', 'Deccan', 18.5140, 73.8380, 'Cleanup & Heavy Lifting', JSON.stringify(['Equipment Transport']), 12.0, 'Car/Van', 'Morning (07:00 - 11:00)', 9],
      ['Pooja More', 'pooja.civic@sevadeep.org', '9822011010', 'Swargate / Mandai', 18.5080, 73.8560, 'Field Documentation / Photography', JSON.stringify(['Public Canvassing']), 7.0, 'None (Walking/Transit)', 'Morning (07:00 - 11:00)', 2],
      ['Kunal Chavan', 'kunal.civic@sevadeep.org', '9822011011', 'Viman Nagar', 18.5679, 73.9143, 'Tree Plantation & Agro', JSON.stringify(['Cleanup & Heavy Lifting']), 18.0, 'Car/Van', 'Morning (07:00 - 11:00)', 5],
      ['Shreya Sawant', 'shreya.civic@sevadeep.org', '9822011012', 'Bhavani Peth', 18.5120, 73.8710, 'Waste Segregation Specialist', JSON.stringify(['First Aid']), 8.0, 'Two-Wheeler', 'Morning (07:00 - 11:00)', 8],
      ['Manish Kadam', 'manish.civic@sevadeep.org', '9822011013', 'Shivajinagar', 18.5280, 73.8520, 'Cleanup & Heavy Lifting', JSON.stringify(['Debris Removal']), 10.0, 'Two-Wheeler', 'Morning (07:00 - 11:00)', 11],
      ['Gauri Natu', 'gauri.civic@sevadeep.org', '9822011014', 'Kothrud', 18.5010, 73.8200, 'Community Coordination / Lead', JSON.stringify(['Botanical Survey']), 10.0, 'Two-Wheeler', 'Morning (07:00 - 11:00)', 7],
      ['Vikrant Salunke', 'vikrant.civic@sevadeep.org', '9822011015', 'Bibwewadi', 18.4770, 73.8680, 'Cleanup & Heavy Lifting', JSON.stringify(['Tools Logistics']), 12.0, 'Two-Wheeler', 'Morning (07:00 - 11:00)', 3]
    ];

    for (const v of volunteers) {
      await connection.query(
        `INSERT INTO civicops_volunteers 
         (name, email, phone, area, latitude, longitude, primary_skill, secondary_skills, max_travel_km, vehicle_type, time_slot, past_assignments_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        v
      );
    }
  }

  // Check if tasks seeded
  const [taskCount] = await connection.query('SELECT COUNT(*) AS count FROM civicops_tasks');
  if (taskCount[0].count === 0) {
    console.log('[CivicOps Init] Seeding 8 Pune civic operations tasks...');
    const tasks = [
      ['Mandai Market Rear Alley Cleanliness Swarm', 'Garbage and Waste Management', 'Swargate / Mandai', 18.5085, 73.8562, 'Critical', 5, 'Cleanup & Heavy Lifting', 2, 4, 'Morning (07:30 - 10:30)', 'Heavy rubber gloves, 20x heavy duty waste sacks, disinfectant powder'],
      ['Mutha Riverbank Shaniwar Wada Ghat Cleanup', 'Environmental Problems', 'Shivajinagar', 18.5195, 73.8553, 'Critical', 5, 'Community Coordination / Lead', 3, 5, 'Morning (07:30 - 10:30)', 'Rakes, plastic trash grabbers, first-aid kit, life vest'],
      ['Vetal Tekdi Hilltop Ridge Sapling Plantation', 'Environmental Problems', 'Kothrud', 18.5204, 73.8150, 'High', 4, 'Tree Plantation & Agro', 2, 4, 'Morning (07:30 - 10:30)', '30 native saplings, digging hoes, organic compost, water cans'],
      ['Saras Baug Perimeter Walkway Restoration', 'Damaged Public Facilities', 'Swargate', 18.5005, 73.8550, 'High', 4, 'Cleanup & Heavy Lifting', 2, 3, 'Morning (07:30 - 10:30)', 'Concrete trowels, bench cleaning wire-brushes, safety goggles'],
      ['FC Road Pedestrian Commercial Waste Canvassing', 'Public Cleanliness', 'Deccan Gymkhana', 18.5185, 73.8415, 'Medium', 3, 'Waste Segregation Specialist', 2, 3, 'Morning (07:30 - 10:30)', 'Bilingual flyers, twin waste bins, camera for documentation'],
      ['Garware College Bus Stop Drain De-silting', 'Water Leakage', 'Deccan', 18.5130, 73.8390, 'Medium', 3, 'Cleanup & Heavy Lifting', 2, 3, 'Morning (07:30 - 10:30)', 'Drain trench shovel, silt buckets, gumboots'],
      ['Kasba Peth Historical Wada Lane Drainage Check', 'Water Leakage', 'Kasba Peth', 18.5190, 73.8590, 'High', 4, 'Field Documentation / Photography', 1, 2, 'Morning (07:30 - 10:30)', 'Inspection camera, moisture meter, citizen interview ledger'],
      ['Hadapsar Gadital Vegetable Waste Segregation', 'Garbage and Waste Management', 'Hadapsar', 18.5050, 73.9280, 'Low', 2, 'Waste Segregation Specialist', 1, 3, 'Morning (07:30 - 10:30)', 'Compost bins, weighing scale, gloves']
    ];

    for (const t of tasks) {
      await connection.query(
        `INSERT INTO civicops_tasks 
         (title, category, area, latitude, longitude, priority, priority_weight, required_skill, min_volunteers, max_volunteers, time_window, equipment_needed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        t
      );
    }
  }

  connection.end();
  console.log('[CivicOps Init] Database setup completed successfully!');
}

if (process.argv[1].endsWith('initCivicOps.js')) {
  initCivicOpsDatabase().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
