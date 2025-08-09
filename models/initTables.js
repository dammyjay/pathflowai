const pool = require("./db");

async function createTables() {
  try {

    // table for push notifications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT NOT NULL,
        keys TEXT NOT NULL
      );
    `);

    // table for push notifications
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT UNIQUE,
        keys JSONB,
        created_at TIMESTAMP
      );
    `);

    // table for company info
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

    // table for pending users
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

    // table for users
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

    // table for career pathways
    await pool.query(
      `CREATE TABLE IF NOT EXISTS career_pathways(
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        target_audience TEXT,
        expected_outcomes TEXT,
        duration_estimate TEXT,
        video_intro_url TEXT,
        show_on_homepage BOOLEAN DEFAULT false
      )`
    );

    // table for courses
    await pool.query(
      `CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
        career_pathway_id INTEGER REFERENCES career_pathways(id) ON DELETE SET NULL,
        thumbnail_url TEXT,
        sort_order INTEGER DEFAULT 0,
        amount INTEGER DEFAULT 0, 
        created_at TIMESTAMP DEFAULT NOW()
      );`
    );

    // table for transactions
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

    //table for benefits
    await pool.query(
      `CREATE TABLE IF NOT EXISTS benefits (
        id SERIAL PRIMARY KEY,
        title TEXT,
        description TEXT,
        icon TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // table for events
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

    // table for event registrations
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

    // table for testimonials
    await pool.query(
      `CREATE TABLE IF NOT EXISTS about_sections (
        id SERIAL PRIMARY KEY,
        section_title TEXT NOT NULL,
        section_key TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );`
    );

    // table for gallery categories
    await pool.query(
      `CREATE TABLE IF NOT EXISTS gallery_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    );

    // table for gallery images
    await pool.query(
      `CREATE TABLE IF NOT EXISTS gallery_images (
        id SERIAL PRIMARY KEY,
        title TEXT,
        image_url TEXT NOT NULL,
        category_id INT REFERENCES gallery_categories(id),
        uploaded_at TIMESTAMP DEFAULT NOW()
      );`
    );

    // table for modules
    await pool.query(
      `CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        objectives TEXT,
        learning_outcomes TEXT,
        thumbnail TEXT,
        order_number INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
      `
    );

    // table for lessons
    await pool.query(
      `CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT,
        video_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      `
    );

    // table for lesson assignments
    await pool.query(
      `CREATE TABLE IF NOT EXISTS lesson_assignments (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        title TEXT,
        instructions TEXT,
        resource_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    );

    // table for module assignments
    await pool.query(
      `CREATE TABLE IF NOT EXISTS module_assignments (
        id SERIAL PRIMARY KEY,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        title TEXT,
        instructions TEXT,
        resource_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );`
    );

    // table for course projects
    await pool.query(
      `CREATE TABLE IF NOT EXISTS course_projects (
        id SERIAL PRIMARY KEY,
          course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          resource_url TEXT,
          created_at TIMESTAMP DEFAULT NOW()
      );
      `
    );

    // table for quizzes
    await pool.query(
      `CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // table for quiz questions
    await pool.query(
      `CREATE TABLE IF NOT EXISTS quiz_questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options TEXT[], -- e.g. ARRAY['A', 'B', 'C', 'D']
        correct_option TEXT NOT NULL,
        question_type VARCHAR(50) DEFAULT 'multiple_choice'
      );
      `
    );

      // table for course enrollments
    await pool.query(
      `CREATE TABLE IF NOT EXISTS course_enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users2(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        enrolled_at TIMESTAMP DEFAULT NOW(),
        progress INTEGER DEFAULT 0
      );
      `
    );

    // table for tracking student XP
    await pool.query(
      `CREATE TABLE IF NOT EXISTS student_xp (
        user_id INTEGER PRIMARY KEY REFERENCES users2(id) ON DELETE CASCADE,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1
      );
      `
    );

    // table for tracking student badges
    await pool.query(
      `CREATE TABLE IF NOT EXISTS student_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users2(id) ON DELETE CASCADE,
        title TEXT,
        awarded_at TIMESTAMP DEFAULT NOW()
      );
      `
    );

    // table for tracking user XP history
    await pool.query(
      `CREATE TABLE IF NOT EXISTS xp_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users2(id) ON DELETE CASCADE,
        xp INTEGER NOT NULL,
        activity TEXT, -- e.g., "Completed lesson", "Quiz passed"
        earned_at TIMESTAMP DEFAULT NOW()
      );
      `
    );

    // table for tracking user badges
    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users2(id) ON DELETE CASCADE,
        badge_name TEXT NOT NULL,
        awarded_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, badge_name)
      );
      `
    );

    // table for tracking lesson completion
    await pool.query(
      `CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users2(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, lesson_id)
      );
      `
    );

    await pool.query(
      `
      `
    );

    await pool.query(
      `
      `
    );

    console.log("✅ All tables are updated and ready.");
  } catch (err) {
    console.error("❌ Error creating tables:", err.message);
  }
}

module.exports = createTables;
