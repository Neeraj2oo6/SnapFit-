const mysql = require('mysql2/promise');
require('dotenv').config();

let pool = null;
let isConnected = false;

// Fallback in-memory state to guarantee zero crashes if MySQL daemon is not running locally
const memoryStore = {
  users: [],
  meals: [
    {
      id: 1,
      user_id: 1,
      name: 'Oatmeal with Blueberries & Chia',
      type: 'Breakfast',
      calories: 340,
      protein: 12,
      carbs: 58,
      fat: 6,
      fiber: 8,
      quantity: 1,
      serving_size: '1 bowl (250g)',
      image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
      meal_date: new Date().toISOString().split('T')[0],
      meal_time: '08:30:00',
      created_at: new Date()
    },
    {
      id: 2,
      user_id: 1,
      name: 'Grilled Chicken Brown Rice Bowl',
      type: 'Lunch',
      calories: 560,
      protein: 44,
      carbs: 62,
      fat: 14,
      fiber: 7,
      quantity: 1,
      serving_size: '1 plate (350g)',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      meal_date: new Date().toISOString().split('T')[0],
      meal_time: '13:15:00',
      created_at: new Date()
    },
    {
      id: 3,
      user_id: 1,
      name: 'Greek Yogurt & Roasted Almonds',
      type: 'Evening Snack',
      calories: 210,
      protein: 18,
      carbs: 15,
      fat: 9,
      fiber: 3,
      quantity: 1,
      serving_size: '1 cup',
      image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80',
      meal_date: new Date().toISOString().split('T')[0],
      meal_time: '17:00:00',
      created_at: new Date()
    }
  ],
  water: {
    glasses: 6,
    target: 8
  },
  activity: [
    { id: 1, user_id: 1, type: 'Morning HIIT & Core', duration: 35, calories: 240, steps: 4200, date: new Date().toISOString().split('T')[0] }
  ],
  fitPoints: 650,
  streak: 5,
  rewards: [
    { id: 1, title: 'Premium Fitness Badge', description: 'Exclusive golden Pro athlete badge on your profile and leaderboards.', points_required: 100, reward_type: 'badge', icon: 'ShieldCheck' },
    { id: 2, title: '30-Day Fitness Challenge', description: 'Advanced high-intensity interval training & macro plans.', points_required: 250, reward_type: 'challenge', icon: 'Flame' },
    { id: 3, title: 'Nutrition Consultation Voucher', description: '20% discount on 1-on-1 certified nutritionist meal coaching.', points_required: 500, reward_type: 'voucher', icon: 'Gift' },
    { id: 4, title: 'SnapFit Pro Monthly Pass', description: '1 Month of unlimited AI vision scans and real-time biometric analysis.', points_required: 1000, reward_type: 'pro_pass', icon: 'Crown' }
  ],
  redemptions: []
};

/**
 * Initialize MySQL connection and execute schema DDL if connected.
 */
async function initDB() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'snapfit_db';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;

  try {
    const tempConnection = await mysql.createConnection({ host, user, password, port });
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4;`);
    await tempConnection.end();

    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Create core tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        dob DATE NULL,
        gender VARCHAR(50) DEFAULT 'Male',
        height_cm INT DEFAULT 175,
        weight_kg DECIMAL(5,2) DEFAULT 70.00,
        goal VARCHAR(100) DEFAULT 'Build Muscle',
        activity_level VARCHAR(50) DEFAULT 'Moderate',
        avatar_url VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS meals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT 'Breakfast',
        calories INT NOT NULL DEFAULT 0,
        protein INT NOT NULL DEFAULT 0,
        carbs INT NOT NULL DEFAULT 0,
        fat INT NOT NULL DEFAULT 0,
        fiber INT NOT NULL DEFAULT 0,
        quantity DECIMAL(5,2) DEFAULT 1.00,
        serving_size VARCHAR(100) DEFAULT '1 serving',
        image_url VARCHAR(500) NULL,
        meal_date DATE DEFAULT (CURRENT_DATE),
        meal_time TIME DEFAULT (CURRENT_TIME),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS water_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        log_date DATE NOT NULL,
        glasses INT DEFAULT 0,
        target_glasses INT DEFAULT 8,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        activity_type VARCHAR(100) NOT NULL DEFAULT 'Workout',
        duration_minutes INT NOT NULL DEFAULT 30,
        calories_burned INT NOT NULL DEFAULT 150,
        steps INT DEFAULT 0,
        log_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    isConnected = true;
    console.log(`[MySQL] Successfully connected to database '${database}' and initialized tables.`);
  } catch (error) {
    isConnected = false;
    console.warn(`[MySQL Notice] Could not connect to MySQL server (${error.message}). Operating smoothly with resilient in-memory storage.`);
  }
}

// ==================== USER REPOSITORY ====================
async function createUser(userData) {
  const { name, email, passwordHash, dob, gender, heightCm, weightKg, goal, activityLevel } = userData;
  if (isConnected && pool) {
    try {
      const [res] = await pool.query(
        `INSERT INTO users (name, email, password_hash, dob, gender, height_cm, weight_kg, goal, activity_level) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email.toLowerCase(), passwordHash, dob || null, gender || 'Male', heightCm || 175, weightKg || 70, goal || 'Build Muscle', activityLevel || 'Moderate']
      );
      return { id: res.insertId, name, email, dob, gender, heightCm, weightKg, goal, activityLevel };
    } catch (err) {
      console.error('[MySQL Error] createUser:', err.message);
    }
  }

  const existing = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const userRecord = {
    id: memoryStore.users.length + 101,
    name,
    email: email.toLowerCase(),
    password_hash: passwordHash,
    dob,
    gender: gender || 'Male',
    height_cm: heightCm || 175,
    weight_kg: weightKg || 70,
    goal: goal || 'Build Muscle',
    activity_level: activityLevel || 'Moderate',
    created_at: new Date()
  };
  memoryStore.users.push(userRecord);
  return userRecord;
}

async function findUserByEmail(email) {
  if (isConnected && pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase()]);
      if (rows.length > 0) return rows[0];
    } catch (err) {
      console.error('[MySQL Error] findUserByEmail:', err.message);
    }
  }
  return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

async function findUserById(id) {
  if (isConnected && pool) {
    try {
      const [rows] = await pool.query('SELECT id, name, email, dob, gender, height_cm, weight_kg, goal, activity_level, created_at FROM users WHERE id = ? LIMIT 1', [id]);
      if (rows.length > 0) return rows[0];
    } catch (err) {
      console.error('[MySQL Error] findUserById:', err.message);
    }
  }
  const u = memoryStore.users.find(u => u.id === Number(id));
  if (u) {
    const { password_hash, ...rest } = u;
    return rest;
  }
  return null;
}

// ==================== MEAL REPOSITORY ====================
async function saveMealToDB(meal, userId = 1) {
  const name = meal.name || 'Logged Meal';
  const type = meal.type || 'Breakfast';
  const calories = Number(meal.calories) || 0;
  const protein = Number(meal.protein) || 0;
  const carbs = Number(meal.carbs) || 0;
  const fat = Number(meal.fat) || 0;
  const fiber = Number(meal.fiber) || 0;
  const quantity = Number(meal.quantity) || 1;
  const servingSize = meal.servingSize || meal.serving_size || '1 serving';
  const imageUrl = meal.imageUrl || meal.image_url || meal.image || null;
  const mealDate = meal.mealDate || meal.date || new Date().toISOString().split('T')[0];
  const mealTime = meal.mealTime || meal.time || new Date().toTimeString().split(' ')[0];

  if (isConnected && pool) {
    try {
      const [result] = await pool.query(
        `INSERT INTO meals (user_id, name, type, calories, protein, carbs, fat, fiber, quantity, serving_size, image_url, meal_date, meal_time) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, name, type, calories, protein, carbs, fat, fiber, quantity, servingSize, imageUrl, mealDate, mealTime]
      );
      return {
        id: result.insertId,
        user_id: userId,
        name,
        type,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        quantity,
        serving_size: servingSize,
        image_url: imageUrl,
        meal_date: mealDate,
        meal_time: mealTime,
        savedToMySQL: true
      };
    } catch (err) {
      console.error('[MySQL Error] saveMealToDB:', err.message);
    }
  }

  const record = {
    id: Date.now(),
    user_id: userId,
    name,
    type,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    quantity,
    serving_size: servingSize,
    image_url: imageUrl,
    meal_date: mealDate,
    meal_time: mealTime,
    savedToMySQL: false
  };
  memoryStore.meals.unshift(record);
  memoryStore.fitPoints += 10;
  return record;
}

async function getMealsFromDB(userId = 1, options = {}) {
  if (isConnected && pool) {
    try {
      let query = 'SELECT * FROM meals WHERE 1=1';
      const params = [];
      if (userId) {
        query += ' AND (user_id = ? OR user_id IS NULL)';
        params.push(userId);
      }
      if (options.date) {
        query += ' AND meal_date = ?';
        params.push(options.date);
      }
      if (options.type && options.type !== 'All') {
        query += ' AND type = ?';
        params.push(options.type);
      }
      query += ' ORDER BY created_at DESC';
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (err) {
      console.error('[MySQL Error] getMealsFromDB:', err.message);
    }
  }

  return memoryStore.meals.filter(m => {
    if (options.type && options.type !== 'All' && m.type !== options.type) return false;
    if (options.date && m.meal_date !== options.date) return false;
    return true;
  });
}

async function getMealByIdFromDB(id) {
  if (isConnected && pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM meals WHERE id = ?', [id]);
      if (rows.length > 0) return rows[0];
    } catch (err) {
      console.error('[MySQL Error] getMealByIdFromDB:', err.message);
    }
  }
  return memoryStore.meals.find(m => String(m.id) === String(id)) || null;
}

async function updateMealInDB(id, updates) {
  if (isConnected && pool) {
    try {
      await pool.query(
        `UPDATE meals SET name = COALESCE(?, name), type = COALESCE(?, type), calories = COALESCE(?, calories),
         protein = COALESCE(?, protein), carbs = COALESCE(?, carbs), fat = COALESCE(?, fat), fiber = COALESCE(?, fiber),
         quantity = COALESCE(?, quantity), serving_size = COALESCE(?, serving_size) WHERE id = ?`,
        [updates.name, updates.type, updates.calories, updates.protein, updates.carbs, updates.fat, updates.fiber, updates.quantity, updates.serving_size, id]
      );
      return getMealByIdFromDB(id);
    } catch (err) {
      console.error('[MySQL Error] updateMealInDB:', err.message);
    }
  }

  const idx = memoryStore.meals.findIndex(m => String(m.id) === String(id));
  if (idx !== -1) {
    memoryStore.meals[idx] = { ...memoryStore.meals[idx], ...updates };
    return memoryStore.meals[idx];
  }
  return null;
}

async function deleteMealFromDB(id) {
  if (isConnected && pool) {
    try {
      const [res] = await pool.query('DELETE FROM meals WHERE id = ?', [id]);
      return res.affectedRows > 0;
    } catch (err) {
      console.error('[MySQL Error] deleteMealFromDB:', err.message);
    }
  }
  const prevLen = memoryStore.meals.length;
  memoryStore.meals = memoryStore.meals.filter(m => String(m.id) !== String(id));
  return memoryStore.meals.length < prevLen;
}

// ==================== WATER & ACTIVITY ====================
async function updateWaterIntake(userId, glasses) {
  memoryStore.water.glasses = Math.max(0, Math.min(16, (memoryStore.water.glasses || 0) + Number(glasses)));
  if (glasses > 0) memoryStore.fitPoints += 15;
  return memoryStore.water;
}

async function getWaterIntake(userId) {
  return memoryStore.water;
}

async function logUserActivity(userId, activity) {
  const item = {
    id: Date.now(),
    user_id: userId,
    type: activity.type || 'Workout',
    duration: Number(activity.duration) || 30,
    calories: Number(activity.calories) || 180,
    steps: Number(activity.steps) || 3500,
    date: new Date().toISOString().split('T')[0]
  };
  memoryStore.activity.unshift(item);
  memoryStore.fitPoints += 20;
  return item;
}

async function getUserActivity(userId) {
  return memoryStore.activity;
}

// ==================== GAMIFIED REWARDS ====================
async function getRewardsData(userId) {
  return {
    fitPoints: memoryStore.fitPoints,
    streakDays: memoryStore.streak,
    availableRewards: memoryStore.rewards,
    redeemedRewards: memoryStore.redemptions
  };
}

async function redeemRewardItem(userId, rewardId) {
  const reward = memoryStore.rewards.find(r => r.id === Number(rewardId));
  if (!reward) throw new Error('Reward not found');
  if (memoryStore.fitPoints < reward.points_required) {
    throw new Error(`Insufficient Fit Points! You need ${reward.points_required - memoryStore.fitPoints} more.`);
  }

  memoryStore.fitPoints -= reward.points_required;
  const voucherCode = `SNAP-${reward.reward_type.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const redemption = {
    id: Date.now(),
    rewardId: reward.id,
    title: reward.title,
    voucherCode,
    pointsSpent: reward.points_required,
    redeemedAt: new Date().toISOString()
  };
  memoryStore.redemptions.unshift(redemption);
  return {
    success: true,
    voucherCode,
    remainingPoints: memoryStore.fitPoints,
    redemption
  };
}

module.exports = {
  initDB,
  createUser,
  findUserByEmail,
  findUserById,
  saveMealToDB,
  getMealsFromDB,
  getMealByIdFromDB,
  updateMealInDB,
  deleteMealFromDB,
  updateWaterIntake,
  getWaterIntake,
  logUserActivity,
  getUserActivity,
  getRewardsData,
  redeemRewardItem,
  isDBConnected: () => isConnected
};
