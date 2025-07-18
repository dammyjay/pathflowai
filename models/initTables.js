const pool = require("./db");

async function createTables() {
  try {
    // await pool.query(`
    //   CREATE TABLE IF NOT EXISTS likes (
    //     id SERIAL PRIMARY KEY,
    //     user_id INTEGER REFERENCES users2(id) ON DELETE CASCADE,
    //     content_type VARCHAR(10) CHECK (content_type IN ('article', 'video')),
    //     content_id INTEGER NOT NULL,
    //     created_at TIMESTAMP DEFAULT NOW(),
    //     UNIQUE(user_id, content_type, content_id)
    //   );
    // `);

    // await pool.query(`
    //   CREATE TABLE IF NOT EXISTS comments (
    //     id SERIAL PRIMARY KEY,
    //     user_id INTEGER REFERENCES users2(id) ON DELETE CASCADE,
    //     content_type VARCHAR(10) CHECK (content_type IN ('article', 'video')),
    //     content_id INTEGER NOT NULL,
    //     comment TEXT NOT NULL,
    //     created_at TIMESTAMP DEFAULT NOW()
    //   );
    // `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT NOT NULL,
        keys TEXT NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT UNIQUE,
        keys JSONB,
        created_at TIMESTAMP
      );
    `);

    // await pool.query(`
    //   CREATE TABLE devotionals (
    //     id SERIAL PRIMARY KEY,
    //     title TEXT NOT NULL,
    //     scripture TEXT,
    //     content TEXT NOT NULL,
    //     image_url TEXT,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   );
    // `);

    await pool.query(
      `CREATE TABLE IF NOT EXISTS company_info(
            id SERIAL PRIMARY KEY,
            logo_url TEXT NOT NULL,
            vision TEXT,
            mission TEXT,
            history TEXT,
            hero_image_url TEXT ,
            company_name TEXT NOT NULL,
            marquee_message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
        );`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS pending_users(
        id SERIAL PRIMARY KEY,
        fullname TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        gender TEXT,
        password TEXT NOT NULL,
        otp_code TEXT,
        otp_expires TIMESTAMP,
        profile_picture TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dob DATE
        
        )`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS users2(
        id SERIAL PRIMARY KEY,
        fullname TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        gender TEXT,
        password TEXT NOT NULL,
        profile_picture TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reset_token TEXT,
        reset_token_expires TIMESTAMP,
        dob DATE,
        wallet_balance NUMERIC DEFAULT 0
      )`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS career_pathways(
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
        career_pathway_id INTEGER REFERENCES career_pathways(id) ON DELETE SET NULL,
        thumbnail_url TEXT,
        sort_order INTEGER DEFAULT 0, 
        created_at TIMESTAMP DEFAULT NOW()
      );`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        fullname TEXT,
        email TEXT,
        amount NUMERIC,
        reference TEXT UNIQUE,
        status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS benefits (
        id SERIAL PRIMARY KEY,
        title TEXT,
        description TEXT,
        icon TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        event_date DATE NOT NULL,
        time TEXT,
        location TEXT,
        is_paid BOOLEAN DEFAULT FALSE,
        amount NUMERIC DEFAULT 0,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        show_on_homepage BOOLEAN DEFAULT false
      );
    `);

    await pool.query(
      `CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        registrant_name TEXT NOT NULL,
        registrant_email TEXT NOT NULL,
        registrant_phone TEXT,
        is_parent BOOLEAN DEFAULT FALSE,
        child_name TEXT,
        amount_paid NUMERIC DEFAULT 0,
        payment_status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
      `
    );


    console.log("✅ All tables are updated and ready.");
  } catch (err) {
    console.error("❌ Error creating tables:", err.message);
  }
}

module.exports = createTables;
