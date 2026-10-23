import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { initCivicOpsDatabase } from './initCivicOps.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MYSQL_URL || process.env.DATABASE_URL;
const DB_NAME = process.env.DB_NAME || process.env.MYSQLDATABASE || 'sevadeep_civicconnect';

const isCloudUri = uri && (
  process.env.DB_SSL === 'true' ||
  uri.includes('tidbcloud') ||
  uri.includes('aivencloud') ||
  uri.includes('clever-cloud') ||
  uri.includes('railway') ||
  uri.includes('ssl=')
);

const sslConfig = (isCloudUri || process.env.DB_SSL === 'true') ? { rejectUnauthorized: false } : undefined;

export async function initializeDatabase() {
  console.log('[DB Init] Connecting to MySQL server for initialization...');
  let connection;
  try {
    if (uri) {
      connection = await mysql.createConnection({
        uri,
        multipleStatements: true,
        ssl: sslConfig
      });
    } else {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
        port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306', 10),
        user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
        password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.MYSQLPASSWORD || 'Shriya@26'),
        database: DB_NAME,
        multipleStatements: true,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
      });
    }

    console.log(`[DB Init] Connected. Ensuring database '${DB_NAME}' schema is prepared...`);
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await connection.query(`USE \`${DB_NAME}\`;`);
    } catch (e) {
      // In restricted managed cloud databases (e.g. Railway), CREATE DATABASE or USE might be disallowed because the connection is already bound to the assigned database
      console.log(`[DB Init] Note: Operating in assigned cloud database context (${DB_NAME}).`);
    }

    // Read and execute schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('[DB Init] Executing schema.sql...');
    await connection.query(schemaSql);
    console.log('[DB Init] Schema created successfully.');

    // Check if users already seeded
    const [existingUsers] = await connection.query('SELECT COUNT(*) AS count FROM users');
    if (existingUsers[0].count === 0) {
      console.log('[DB Init] Seeding initial demo data for Sevadeep CivicConnect...');
      await seedDatabase(connection);
      console.log('[DB Init] Demo data seeded successfully!');
    } else {
      console.log(`[DB Init] Database already contains ${existingUsers[0].count} users. Skipping seed.`);
    }

    // Initialize CivicOps (Feature 2) tables and Pune tasks/volunteers
    try {
      console.log('[DB Init] Initializing CivicOps resources and deployment models...');
      await initCivicOpsDatabase(connection);
      console.log('[DB Init] CivicOps tables verified.');
    } catch (opsErr) {
      console.warn('[DB Init Warning] CivicOps init warning:', opsErr.message);
    }

    return true;
  } catch (error) {
    console.error('[DB Init Error] Failed to initialize database:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function seedDatabase(conn) {
  const defaultPassword = 'Password@123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  // 1. Seed Users
  const users = [
    {
      name: 'Dr. Ananya Joshi',
      email: 'coordinator@sevadeep.org',
      password_hash: passwordHash,
      phone: '+91 98230 11223',
      role: 'coordinator',
      address: 'Deccan Gymkhana, Pune',
      area: 'Shivajinagar / Deccan',
      avatar_url: '/assets/team_conclusion.png',
      points: 120
    },
    {
      name: 'Vikram Deshmukh',
      email: 'admin@sevadeep.org',
      password_hash: passwordHash,
      phone: '+91 98220 99887',
      role: 'coordinator',
      address: 'Model Colony, Pune',
      area: 'Model Colony',
      avatar_url: '/assets/team_conclusion.png',
      points: 95
    },
    {
      name: 'Aarav Kulkarni',
      email: 'volunteer@sevadeep.org',
      password_hash: passwordHash,
      phone: '+91 94220 33445',
      role: 'volunteer',
      address: 'Mayur Colony, Kothrud, Pune',
      area: 'Kothrud',
      avatar_url: '/assets/volunteer_action_1.png',
      points: 75
    },
    {
      name: 'Priya Patil',
      email: 'priya@sevadeep.org',
      password_hash: passwordHash,
      phone: '+91 91234 55667',
      role: 'volunteer',
      address: 'Ghole Road, Shivajinagar, Pune',
      area: 'Shivajinagar',
      avatar_url: '/assets/volunteer_action_3.png',
      points: 60
    },
    {
      name: 'Rohan Shinde',
      email: 'rohan@sevadeep.org',
      password_hash: passwordHash,
      phone: '+91 97654 33211',
      role: 'volunteer',
      address: 'Shaniwar Peth, Pune',
      area: 'Shaniwar Peth',
      avatar_url: '/assets/volunteer_action_2.png',
      points: 35
    },
    {
      name: 'Sunita Deshmukh',
      email: 'citizen@sevadeep.org',
      password_hash: passwordHash,
      phone: '+91 98901 22334',
      role: 'community_member',
      address: 'Fergusson College Road, Pune',
      area: 'Shivajinagar',
      avatar_url: null,
      points: 25
    },
    {
      name: 'Rahul Sharma',
      email: 'rahul@sevadeep.org',
      password_hash: passwordHash,
      phone: '+91 98765 43210',
      role: 'community_member',
      address: 'Shukrawar Peth, Pune',
      area: 'Mandai / Shukrawar Peth',
      avatar_url: null,
      points: 15
    }
  ];

  for (const u of users) {
    await conn.query(
      `INSERT INTO users (name, email, password_hash, phone, role, address, area, avatar_url, points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.name, u.email, u.password_hash, u.phone, u.role, u.address, u.area, u.avatar_url, u.points]
    );
  }

  // 2. Seed Community Reports
  const reports = [
    {
      reference_no: 'SVD-2026-0101',
      reporter_id: 6, // Sunita
      title: 'Garbage accumulation and overflowing dumpster near FC Road Main Gate',
      description: 'The community dumpster near the main gate of Fergusson College has been overflowing for the last 3 days. Domestic waste and plastic bags are spilling across the pedestrian sidewalk causing severe health hazard and foul stench.',
      category: 'Garbage and Waste Management',
      severity: 'High',
      status: 'Resolved',
      location_address: 'Opposite Fergusson College Main Gate, FC Road, Shivajinagar, Pune',
      area: 'Shivajinagar',
      latitude: 18.520428,
      longitude: 73.840214,
      is_public: true,
      assigned_volunteer_id: 3, // Aarav
      coordinator_id: 1, // Dr. Ananya
      coordinator_notes: 'Sevadeep volunteer team mobilized alongside PMC ward 7 sanitary inspectors. Full cleanup completed and new waste segregation bins installed.',
      resolution_notes: 'Entire sidewalk cleared, disinfected with lime powder, and community awareness posters installed to prevent dumping.',
      resolution_photo: '/uploads/drive_cleanliness_2.jpeg',
      reporter_feedback: 'Extremely grateful to Sevadeep volunteers and coordinator for prompt action within 24 hours!',
      reporter_rating: 5,
      reporter_confirmed_resolution: true,
      municipal_referral_status: 'Coordinated with PMC Solid Waste Management Ward 7',
      created_at: '2026-10-10 09:30:00'
    },
    {
      reference_no: 'SVD-2026-0102',
      reporter_id: 7, // Rahul
      title: 'Severe drinking water pipeline rupture flooding pedestrian pathway',
      description: 'Major water leakage from municipal pipeline near Deccan Gymkhana bus depot. Fresh potable water is continuously getting wasted and submerging the zebra crossing and walkway.',
      category: 'Water Leakage',
      severity: 'Critical',
      status: 'In Progress',
      location_address: 'Near Deccan Gymkhana Bus Station, Karve Road Junction, Pune',
      area: 'Deccan Gymkhana',
      latitude: 18.516781,
      longitude: 73.841528,
      is_public: true,
      assigned_volunteer_id: 4, // Priya
      coordinator_id: 1,
      coordinator_notes: 'Official grievance escalated to PMC Water Supply Department. Sevadeep volunteer Priya Patil monitoring on-site temporary barricades.',
      resolution_notes: null,
      resolution_photo: null,
      municipal_referral_status: 'Formally Escalated to PMC Water Supply Department (Docket #PMC-WTR-8821)',
      created_at: '2026-10-14 11:15:00'
    },
    {
      reference_no: 'SVD-2026-0103',
      reporter_id: 7, // Rahul
      title: 'Illegal plastic dump and unsanitary conditions behind Mandai vegetable market',
      description: 'Heaps of discarded single-use plastic crates, rotten vegetables, and packing materials piled up along the back lane of Mahatma Phule Mandai.',
      category: 'Public Cleanliness',
      severity: 'High',
      status: 'Approved',
      location_address: 'Baji Rao Road, Near Mandai Clock Tower, Shukrawar Peth, Pune',
      area: 'Mandai',
      latitude: 18.513412,
      longitude: 73.856241,
      is_public: true,
      assigned_volunteer_id: 3, // Aarav
      coordinator_id: 2, // Vikram
      coordinator_notes: 'Approved for community cleanliness drive this Saturday. 15 volunteer slots reserved.',
      resolution_notes: null,
      resolution_photo: null,
      municipal_referral_status: 'Notified Mandai Merchants Association and PMC Zone 3',
      created_at: '2026-10-15 14:00:00'
    },
    {
      reference_no: 'SVD-2026-0104',
      reporter_id: 6, // Sunita
      title: 'Broken safety railing and missing walkway paving stones on Lakdi Pul',
      description: 'A 4-meter section of the pedestrian iron railing along Sambhaji Bridge (Lakdi Pul) is damaged and bent towards the riverbed. Poses dangerous hazard for senior citizens and evening pedestrians.',
      category: 'Damaged Public Facilities',
      severity: 'Critical',
      status: 'Under Review',
      location_address: 'Lakdi Pul / Sambhaji Bridge Footpath, Deccan to Alka Talkies stretch, Pune',
      area: 'Deccan Gymkhana',
      latitude: 18.515201,
      longitude: 73.847155,
      is_public: false,
      assigned_volunteer_id: null,
      coordinator_id: null,
      coordinator_notes: 'Under review by Coordinator Vikram Deshmukh. Inspecting bridge structural division authority.',
      created_at: '2026-10-16 16:40:00'
    },
    {
      reference_no: 'SVD-2026-0105',
      reporter_id: 6, // Sunita
      title: 'Plastic bottle debris and water hyacinth choking Mutha Riverbank',
      description: 'Large cluster of floating plastic bottles, thermocol packaging, and dense weed accumulating along the riverbank near Baba Bhide causeway.',
      category: 'Environmental Problems',
      severity: 'Medium',
      status: 'Approved',
      location_address: 'Baba Bhide Bridge Riverbed Walkway, Pune',
      area: 'Deccan',
      latitude: 18.519124,
      longitude: 73.848832,
      is_public: true,
      assigned_volunteer_id: 5, // Rohan
      coordinator_id: 1,
      coordinator_notes: 'Approved. Included in the upcoming Sunday Mutha Riverbed Volunteer Drive.',
      created_at: '2026-10-17 08:30:00'
    },
    {
      reference_no: 'SVD-2026-0106',
      reporter_id: 7, // Rahul
      title: 'Clogged roadside stormwater gutter with stagnating blackwater',
      description: 'The rainwater drain beside Kothrud Bus Depot is blocked with construction sediment and plastic cups, leading to foul odor and mosquito breeding.',
      category: 'Garbage and Waste Management',
      severity: 'Medium',
      status: 'Submitted',
      location_address: 'Near Kothrud Bus Depot, Paud Road, Pune',
      area: 'Kothrud',
      latitude: 18.507421,
      longitude: 73.807715,
      is_public: false,
      assigned_volunteer_id: null,
      coordinator_id: null,
      coordinator_notes: null,
      created_at: '2026-10-18 10:20:00'
    },
    {
      reference_no: 'SVD-2026-0107',
      reporter_id: 6, // Sunita
      title: 'Overgrown wild grass and broken tree branches obstructing road divider',
      description: 'Storm knocked branches onto median strip near Symbiosis College, blocking headlight visibility for night drivers.',
      category: 'Environmental Problems',
      severity: 'Low',
      status: 'In Progress',
      location_address: 'Senapati Bapat Road, Near ICC Tech Park, Pune',
      area: 'Shivajinagar',
      latitude: 18.531411,
      longitude: 73.829621,
      is_public: true,
      assigned_volunteer_id: 4, // Priya
      coordinator_id: 2,
      coordinator_notes: 'Volunteer team dispatched with hedge trimmers and pruning tools.',
      created_at: '2026-10-17 14:10:00'
    },
    {
      reference_no: 'SVD-2026-0108',
      reporter_id: 7, // Rahul
      title: 'Broken cement benches and litter surrounding Saras Baug outer perimeter',
      description: 'Cement benches near the southern entrance of Saras Baug garden were broken and glass bottles were scattered around.',
      category: 'Damaged Public Facilities',
      severity: 'Medium',
      status: 'Resolved',
      location_address: 'Southern Gate, Saras Baug, Swargate, Pune',
      area: 'Swargate',
      latitude: 18.501815,
      longitude: 73.852719,
      is_public: true,
      assigned_volunteer_id: 5, // Rohan
      coordinator_id: 1,
      coordinator_notes: 'Sevadeep weekend volunteers coordinated with garden superintendent. Debris cleaned up and benches repaired.',
      resolution_notes: 'Glass shards and litter removed in 4 waste bags; park bench repaired with cement mortar.',
      resolution_photo: '/uploads/drive_cleanliness_1.jpeg',
      reporter_feedback: 'Great community initiative! Safe for kids again.',
      reporter_rating: 5,
      reporter_confirmed_resolution: true,
      created_at: '2026-10-08 16:00:00'
    }
  ];

  for (const r of reports) {
    await conn.query(
      `INSERT INTO reports (
        reference_no, reporter_id, title, description, category, severity, status,
        location_address, area, latitude, longitude, is_public, assigned_volunteer_id,
        coordinator_id, coordinator_notes, resolution_notes, resolution_photo,
        reporter_feedback, reporter_rating, reporter_confirmed_resolution,
        municipal_referral_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        r.reference_no, r.reporter_id, r.title, r.description, r.category, r.severity, r.status,
        r.location_address, r.area, r.latitude, r.longitude, r.is_public, r.assigned_volunteer_id,
        r.coordinator_id, r.coordinator_notes, r.resolution_notes, r.resolution_photo,
        r.reporter_feedback, r.reporter_rating, r.reporter_confirmed_resolution,
        r.municipal_referral_status || null, r.created_at
      ]
    );
  }

  // 3. Seed Photographs
  const photos = [
    { report_id: 1, photo_url: '/uploads/drive_cleanliness_gps.png', caption: 'Initial garbage overflow at FC Road', is_primary: true, photo_type: 'before', uploaded_by_id: 6 },
    { report_id: 1, photo_url: '/uploads/drive_cleanliness_2.jpeg', caption: 'Resolved site after volunteer cleanup', is_primary: false, photo_type: 'after', uploaded_by_id: 3 },
    { report_id: 2, photo_url: '/uploads/drive_cleanliness_3.jpeg', caption: 'Water gushing on footpath near Deccan station', is_primary: true, photo_type: 'evidence', uploaded_by_id: 7 },
    { report_id: 3, photo_url: '/uploads/drive_cleanliness_1.jpeg', caption: 'Accumulated waste behind Mandai stalls', is_primary: true, photo_type: 'evidence', uploaded_by_id: 7 },
    { report_id: 5, photo_url: '/uploads/volunteer_action_4.png', caption: 'Plastic debris stuck in hyacinth bed', is_primary: true, photo_type: 'evidence', uploaded_by_id: 6 },
    { report_id: 7, photo_url: '/uploads/drive_plantation_1.png', caption: 'Overgrown divider bushes', is_primary: true, photo_type: 'evidence', uploaded_by_id: 6 },
    { report_id: 8, photo_url: '/uploads/volunteer_action_5.png', caption: 'Benches and broken litter before cleanup', is_primary: true, photo_type: 'before', uploaded_by_id: 7 },
    { report_id: 8, photo_url: '/uploads/drive_cleanliness_1.jpeg', caption: 'Repaired and clean perimeter garden', is_primary: false, photo_type: 'after', uploaded_by_id: 5 }
  ];

  for (const p of photos) {
    await conn.query(
      `INSERT INTO report_photographs (report_id, photo_url, caption, is_primary, photo_type, uploaded_by_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [p.report_id, p.photo_url, p.caption, p.is_primary, p.photo_type, p.uploaded_by_id]
    );
  }

  // 4. Seed Status History
  const histories = [
    { report_id: 1, previous_status: null, new_status: 'Submitted', changed_by_id: 6, notes: 'Issue submitted with photo evidence by resident.' },
    { report_id: 1, previous_status: 'Submitted', new_status: 'Under Review', changed_by_id: 1, notes: 'Dr. Ananya Joshi started review.' },
    { report_id: 1, previous_status: 'Under Review', new_status: 'Approved', changed_by_id: 1, notes: 'Approved for public display and assigned to volunteer Aarav.' },
    { report_id: 1, previous_status: 'Approved', new_status: 'In Progress', changed_by_id: 3, notes: 'Volunteer Aarav reached location with cleaning equipment.' },
    { report_id: 1, previous_status: 'In Progress', new_status: 'Resolved', changed_by_id: 1, notes: 'Cleanup verified on site by coordinator. Case closed.' },
    { report_id: 2, previous_status: null, new_status: 'Submitted', changed_by_id: 7, notes: 'Water leakage reported by citizen.' },
    { report_id: 2, previous_status: 'Submitted', new_status: 'Approved', changed_by_id: 1, notes: 'Approved and escalated to PMC Water Supply Department.' },
    { report_id: 2, previous_status: 'Approved', new_status: 'In Progress', changed_by_id: 1, notes: 'PMC maintenance squad and Sevadeep safety team deployed.' },
    { report_id: 3, previous_status: null, new_status: 'Submitted', changed_by_id: 7, notes: 'Reported by local shopkeeper.' },
    { report_id: 3, previous_status: 'Submitted', new_status: 'Approved', changed_by_id: 2, notes: 'Approved by Vikram Deshmukh. Volunteer activity scheduled.' }
  ];

  for (const h of histories) {
    await conn.query(
      `INSERT INTO status_history (report_id, previous_status, new_status, changed_by_id, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [h.report_id, h.previous_status, h.new_status, h.changed_by_id, h.notes]
    );
  }

  // 5. Seed Community Confirmations
  const confirmations = [
    { report_id: 1, user_id: 3 },
    { report_id: 1, user_id: 4 },
    { report_id: 1, user_id: 7 },
    { report_id: 2, user_id: 6 },
    { report_id: 2, user_id: 3 },
    { report_id: 3, user_id: 6 },
    { report_id: 3, user_id: 4 },
    { report_id: 3, user_id: 5 },
    { report_id: 5, user_id: 7 },
    { report_id: 5, user_id: 4 }
  ];

  for (const c of confirmations) {
    await conn.query(
      `INSERT INTO community_confirmations (report_id, user_id) VALUES (?, ?)`,
      [c.report_id, c.user_id]
    );
  }

  // 6. Seed Comments
  const comments = [
    { report_id: 1, user_id: 3, comment_text: 'I live nearby on Ghole Road; can confirm the bins were tipped over by stray animals. Heading over with gloves and bags.', photo_url: null },
    { report_id: 1, user_id: 6, comment_text: 'Thank you Aarav and Sevadeep team for arriving so fast! The spot looks completely clean now.', photo_url: null },
    { report_id: 2, user_id: 4, comment_text: 'Water pressure is very high at this leak point. Pedestrians please take the inner footpath across Garware bridge.', photo_url: null },
    { report_id: 3, user_id: 5, comment_text: 'We spoke with two shopkeepers at Mandai; they agreed to keep dedicated trash bins inside instead of dumping in the alley.', photo_url: null }
  ];

  for (const cm of comments) {
    await conn.query(
      `INSERT INTO comments (report_id, user_id, comment_text, photo_url) VALUES (?, ?, ?, ?)`,
      [cm.report_id, cm.user_id, cm.comment_text, cm.photo_url]
    );
  }

  // 7. Seed Events (Volunteer Activities)
  const events = [
    {
      title: 'Mutha Riverbed Community Cleanliness & Waste Segregation Drive',
      category: 'Cleanliness Drive',
      description: 'Join Sevadeep coordinators and neighborhood volunteers for an intensive cleanliness mission along the Mutha riverbed near Deccan Gymkhana. We will segregate recyclable plastic, remove floating debris, and clear walking paths. Safety gloves, biodegradable sacks, and refreshments provided.',
      event_date: '2026-10-25',
      start_time: '07:30 AM',
      end_time: '11:00 AM',
      location_name: 'Mutha Riverfront Walkway, Near Baba Bhide Bridge, Deccan, Pune',
      latitude: 18.519124,
      longitude: 73.848832,
      total_slots: 40,
      coordinator_id: 1,
      cover_image: '/assets/drive_cleanliness_1.jpeg',
      status: 'Upcoming',
      completion_summary: null,
      waste_collected_kg: 0,
      trees_planted: 0
    },
    {
      title: 'Pune Green Horizon: Native Sapling Plantation at Vetal Tekdi',
      category: 'Tree Plantation',
      description: 'A community afforestation campaign planting native drought-tolerant trees (Neem, Peepal, Karanj, Banyan) along Vetal Tekdi hill slope to restore biodiversity and curb soil erosion. Experts from Sevadeep will guide planting and soil preparation techniques.',
      event_date: '2026-11-01',
      start_time: '07:00 AM',
      end_time: '10:30 AM',
      location_name: 'Vetal Tekdi Hill Base, Paud Road / Kothrud Side, Pune',
      latitude: 18.528410,
      longitude: 73.818290,
      total_slots: 50,
      coordinator_id: 2,
      cover_image: '/assets/drive_plantation_1.png',
      status: 'Upcoming',
      completion_summary: null,
      waste_collected_kg: 0,
      trees_planted: 0
    },
    {
      title: 'Katraj Lake Wetland Restoration & Plastic Interception Drive',
      category: 'Lake Restoration',
      description: 'Community cleanup drive focused on the marshy perimeter of Katraj Lake. Volunteers will help remove discarded PET bottles, non-biodegradable silt, and overgrown weeds to safeguard migratory birds and aquatic fauna.',
      event_date: '2026-11-08',
      start_time: '08:00 AM',
      end_time: '11:30 AM',
      location_name: 'Katraj Lake Garden Perimeter, Pune-Satara Road, Pune',
      latitude: 18.455610,
      longitude: 73.864320,
      total_slots: 35,
      coordinator_id: 1,
      cover_image: '/assets/drive_cleanliness_3.jpeg',
      status: 'Upcoming',
      completion_summary: null,
      waste_collected_kg: 0,
      trees_planted: 0
    },
    {
      title: 'Kothrud Neighborhood Door-to-Door Waste Segregation Campaign',
      category: 'Environmental Awareness',
      description: 'Volunteers and coordinators visited 250 households in Mahatma Society, Kothrud to demonstrate proper wet/dry/hazardous household waste segregation at source.',
      event_date: '2026-10-04',
      start_time: '09:00 AM',
      end_time: '12:30 PM',
      location_name: 'Mahatma Society, Kothrud, Pune',
      latitude: 18.498120,
      longitude: 73.805430,
      total_slots: 25,
      coordinator_id: 1,
      cover_image: '/assets/volunteer_action_1.png',
      status: 'Completed',
      completion_summary: '250 households engaged; 100% distribution of color-coded wet/dry segregation guides. Great community enthusiasm.',
      waste_collected_kg: 185.50,
      trees_planted: 0
    },
    {
      title: 'Historic Shaniwar Wada & Kasba Peth Heritage Cleanliness Drive',
      category: 'Cleanliness Drive',
      description: 'Community volunteers cleared tourist litter, plastic packaging, and discarded flyers along the historic Shaniwar Wada perimeter.',
      event_date: '2026-09-27',
      start_time: '07:00 AM',
      end_time: '10:30 AM',
      location_name: 'Shaniwar Wada Courtyard & Outer Moat, Kasba Peth, Pune',
      latitude: 18.519450,
      longitude: 73.855320,
      total_slots: 40,
      coordinator_id: 2,
      cover_image: '/assets/drive_cleanliness_2.jpeg',
      status: 'Completed',
      completion_summary: 'Over 340 kg of plastic bottles, food wrappers, and dry debris removed and sent to PMC authorized recycling center.',
      waste_collected_kg: 342.00,
      trees_planted: 15
    }
  ];

  for (const ev of events) {
    await conn.query(
      `INSERT INTO events (
        title, category, description, event_date, start_time, end_time, location_name,
        latitude, longitude, total_slots, coordinator_id, cover_image, status,
        completion_summary, waste_collected_kg, trees_planted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ev.title, ev.category, ev.description, ev.event_date, ev.start_time, ev.end_time,
        ev.location_name, ev.latitude, ev.longitude, ev.total_slots, ev.coordinator_id,
        ev.cover_image, ev.status, ev.completion_summary, ev.waste_collected_kg, ev.trees_planted
      ]
    );
  }

  // 8. Seed Event Registrations
  const registrations = [
    { event_id: 1, user_id: 3, registration_status: 'Registered', hours_contributed: 0 },
    { event_id: 1, user_id: 4, registration_status: 'Registered', hours_contributed: 0 },
    { event_id: 1, user_id: 6, registration_status: 'Registered', hours_contributed: 0 },
    { event_id: 2, user_id: 3, registration_status: 'Registered', hours_contributed: 0 },
    { event_id: 2, user_id: 5, registration_status: 'Registered', hours_contributed: 0 },
    { event_id: 4, user_id: 3, registration_status: 'Attended', hours_contributed: 3.5 },
    { event_id: 4, user_id: 4, registration_status: 'Attended', hours_contributed: 3.5 },
    { event_id: 5, user_id: 3, registration_status: 'Attended', hours_contributed: 3.5 },
    { event_id: 5, user_id: 5, registration_status: 'Attended', hours_contributed: 3.5 }
  ];

  for (const reg of registrations) {
    await conn.query(
      `INSERT INTO event_registrations (event_id, user_id, registration_status, hours_contributed)
       VALUES (?, ?, ?, ?)`,
      [reg.event_id, reg.user_id, reg.registration_status, reg.hours_contributed]
    );
  }

  // 9. Seed Volunteer Assignments
  const assignments = [
    { report_id: 1, volunteer_id: 3, assigned_by_id: 1, assignment_notes: 'Urgent garbage cleanup at FC Road gate. Coordinate with PMC sanitary team.', progress_status: 'Verified', completion_notes: 'Cleaned and disinfected with bleaching powder.' },
    { report_id: 2, volunteer_id: 4, assigned_by_id: 1, assignment_notes: 'Monitor water leak boundary and place safety tape while PMC water squad works.', progress_status: 'In Progress', completion_notes: null },
    { report_id: 3, volunteer_id: 3, assigned_by_id: 2, assignment_notes: 'Inspect back alley behind Mandai market and list cleanup supplies required.', progress_status: 'Assigned', completion_notes: null }
  ];

  for (const as of assignments) {
    await conn.query(
      `INSERT INTO volunteer_assignments (report_id, volunteer_id, assigned_by_id, assignment_notes, progress_status, completion_notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [as.report_id, as.volunteer_id, as.assigned_by_id, as.assignment_notes, as.progress_status, as.completion_notes]
    );
  }

  // 10. Seed Notifications
  const notifications = [
    { user_id: 6, title: 'Report SVD-2026-0101 Resolved!', message: 'Sevadeep team has successfully completed the cleanup near Fergusson College Road. Please submit your feedback.', type: 'report_status', link: '/issues/1' },
    { user_id: 3, title: 'New Volunteer Assignment', message: 'You have been assigned to verify and coordinate cleanup at Mandai Market (SVD-2026-0103).', type: 'assignment', link: '/issues/3' },
    { user_id: 7, title: 'Municipal Escalation Update', message: 'Your report regarding water leakage near Deccan Gymkhana (SVD-2026-0102) has been escalated to PMC Water Supply Dept.', type: 'report_status', link: '/issues/2' },
    { user_id: 6, title: 'Upcoming Activity Reminder', message: 'Reminder: Mutha Riverbed Community Cleanliness Drive is on Sunday, Oct 25 at 07:30 AM.', type: 'event_reminder', link: '/activities/1' }
  ];

  for (const n of notifications) {
    await conn.query(
      `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)`,
      [n.user_id, n.title, n.message, n.type, n.link]
    );
  }

  // 11. Seed Audit Logs
  const auditLogs = [
    { action: 'USER_REGISTERED', user_id: 6, target_type: 'User', target_id: 6, details: 'Resident Sunita Deshmukh registered as community member.' },
    { action: 'REPORT_SUBMITTED', user_id: 6, target_type: 'Report', target_id: 1, details: 'Report SVD-2026-0101 submitted for FC Road.' },
    { action: 'REPORT_APPROVED', user_id: 1, target_type: 'Report', target_id: 1, details: 'Dr. Ananya Joshi approved report SVD-2026-0101.' },
    { action: 'VOLUNTEER_ASSIGNED', user_id: 1, target_type: 'Report', target_id: 1, details: 'Volunteer Aarav Kulkarni assigned to SVD-2026-0101.' },
    { action: 'REPORT_RESOLVED', user_id: 1, target_type: 'Report', target_id: 1, details: 'Status changed to Resolved after on-site verification.' }
  ];

  for (const a of auditLogs) {
    await conn.query(
      `INSERT INTO audit_logs (action, user_id, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)`,
      [a.action, a.user_id, a.target_type, a.target_id, a.details]
    );
  }
}

// Run directly if invoked via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal initialization error:', err);
      process.exit(1);
    });
}
