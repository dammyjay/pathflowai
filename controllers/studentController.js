const pool = require("../models/db");

// GET: Student Dashboard
exports.getDashboard = async (req, res) => {
  const studentId = req.user.id;

  const infoResult = await pool.query(
        "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
      );
  const info = infoResult.rows[0] || {};
  const isLoggedIn = !!req.session.user; // or whatever property you use for login
  const profilePic = req.session.user ? req.session.user.profile_picture : null;

  let walletBalance = 0;
     if (req.session.user) {
       const walletResult = await pool.query(
         "SELECT wallet_balance2 FROM users2 WHERE email = $1",
         [req.session.user.email]
       );
       walletBalance = walletResult.rows[0]?.wallet_balance2 || 0;
     }

  try {
    const [studentRes, enrolledCoursesRes, badgesRes, xpHistoryRes] =
      await Promise.all([
        pool.query("SELECT * FROM users2 WHERE id = $1", [studentId]),
        pool.query(
          `
        SELECT c.*, e.progress
        FROM course_enrollments e
        JOIN courses c ON c.id = e.course_id
        WHERE e.user_id = $1
        ORDER BY c.created_at DESC
      `,
          [studentId]
        ),
        pool.query(`SELECT * FROM user_badges WHERE user_id = $1`, [studentId]),
        pool.query(
          `SELECT * FROM xp_history WHERE user_id = $1 ORDER BY earned_at DESC LIMIT 10`,
          [studentId]
        ),
      ]);

    res.render("student/dashboard", {
      student: studentRes.rows[0],
      info,
      profilePic,
      isLoggedIn,
      users: req.session.user,
      walletBalance,
      subscribed: req.query.subscribed,
      enrolledCourses: enrolledCoursesRes.rows,
      courses: enrolledCoursesRes.rows, // if using courses tab
      badges: badgesRes.rows,
      xpHistory: xpHistoryRes.rows,
    });
  } catch (err) {
    console.error("Error loading dashboard:", err.message);
    res.status(500).send("Server Error");
  }
};

// GET: All Enrolled Courses
exports.getEnrolledCourses = async (req, res) => {
  const studentId = req.user.id;
  const infoResult = await pool.query(
    "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
  );
  const info = infoResult.rows[0] || {};
  const isLoggedIn = !!req.session.user; // or whatever property you use for login
  const profilePic = req.session.user ? req.session.user.profile_picture : null;

  const [studentRes, enrolledCoursesRes, badgesRes, xpHistoryRes] =
    await Promise.all([
      pool.query("SELECT * FROM users2 WHERE id = $1", [studentId]),
      pool.query(
        `
        SELECT c.*, e.progress
        FROM course_enrollments e
        JOIN courses c ON c.id = e.course_id
        WHERE e.user_id = $1
        ORDER BY c.created_at DESC
      `,
        [studentId]
      ),
      pool.query(`SELECT * FROM user_badges WHERE user_id = $1`, [studentId]),
      pool.query(
        `SELECT * FROM xp_history WHERE user_id = $1 ORDER BY earned_at DESC LIMIT 10`,
        [studentId]
      ),
    ]);
  let walletBalance = 0;
  if (req.session.user) {
    const walletResult = await pool.query(
      "SELECT wallet_balance2 FROM users2 WHERE email = $1",
      [req.session.user.email]
    );
    walletBalance = walletResult.rows[0]?.wallet_balance2 || 0;
  }

  try {
    const result = await pool.query(
      `
      SELECT c.*, e.progress
      FROM course_enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.user_id = $1
      ORDER BY c.title ASC
    `,
      [studentId]
    );

    // res.render("student/courses", { courses: result.rows });
    res.render("student/dashboard", {
      student: studentRes.rows[0],
      courses: result.rows,
      info,
      isLoggedIn,
      users: req.session.user,
      walletBalance,
      profilePic,
      enrolledCourses: enrolledCoursesRes.rows,
      courses: enrolledCoursesRes.rows, // if using courses tab
      badges: badgesRes.rows,
      xpHistory: xpHistoryRes.rows,
    });
  } catch (err) {
    console.error("Error fetching courses:", err.message);
    res.status(500).send("Server Error");
  }
};

// GET: Learning Analytics
exports.getAnalytics = async (req, res) => {
  const studentId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT m.title AS module, COUNT(l.id) AS lessons_completed
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN user_lesson_progress p ON p.lesson_id = l.id
      WHERE p.user_id = $1
      GROUP BY m.title
      ORDER BY m.title
    `,
      [studentId]
    );

    const labels = result.rows.map((row) => row.module);
    const data = result.rows.map((row) => Number(row.lessons_completed));

    res.render("student/dashboard", {
      chart: { labels, data },
    });
  } catch (err) {
    console.error("Error loading analytics:", err.message);
    res.status(500).send("Server Error");
  }
};

// POST: Update XP and log it
exports.updateXP = async (req, res) => {
  const userId = req.user.id;
  const { xpGained, activity = "learning" } = req.body;

  try {
    const user = await pool.query("SELECT xp FROM users2 WHERE id = $1", [
      userId,
    ]);
    const currentXP = user.rows[0]?.xp || 0;
    const newXP = currentXP + Number(xpGained);

    await Promise.all([
      pool.query("UPDATE users2 SET xp = $1 WHERE id = $2", [newXP, userId]),
      pool.query(
        `INSERT INTO xp_history (user_id, xp, activity)
         VALUES ($1, $2, $3)`,
        [userId, xpGained, activity]
      ),
    ]);

    res.json({ message: "XP updated", xp: newXP });
  } catch (err) {
    console.error("XP update error:", err);
    res.status(500).json({ error: "Server error updating XP" });
  }
};

// POST: Award Badge
exports.awardBadge = async (req, res) => {
  const userId = req.user.id;
  const { badge_name } = req.body;

  try {
    await pool.query(
      `
      INSERT INTO user_badges (user_id, badge_name)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `,
      [userId, badge_name]
    );

    res.json({ message: "Badge awarded successfully" });
  } catch (err) {
    console.error("Badge awarding error:", err.message);
    res.status(500).json({ error: "Server error awarding badge" });
  }
};


// POST: Mark lesson complete, award XP, and check for badge
exports.completeLesson = async (req, res) => {
  const userId = req.user.id;
  const lessonId = req.params.lessonId;

  try {
    // 1. Mark lesson as completed (if not already)
    await pool.query(`
      INSERT INTO user_lesson_progress (user_id, lesson_id, completed_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT DO NOTHING
    `, [userId, lessonId]);

    // 2. Award XP (say 10 XP per lesson)
    const xpGained = 10;
    const activity = `Completed lesson ${lessonId}`;
    await pool.query("UPDATE users2 SET xp = COALESCE(xp, 0) + $1 WHERE id = $2", [xpGained, userId]);

    // 3. Log XP history
    await pool.query(`
      INSERT INTO xp_history (user_id, xp, activity)
      VALUES ($1, $2, $3)
    `, [userId, xpGained, activity]);

    // 4. Count total completed lessons
    const result = await pool.query(`
      SELECT COUNT(*) FROM user_lesson_progress
      WHERE user_id = $1
    `, [userId]);

    const completedCount = parseInt(result.rows[0].count);

    // 5. Award badge based on threshold
    const badgeThresholds = [
      { count: 5, name: "Beginner Streak" },
      { count: 10, name: "Learning Champ" },
      { count: 20, name: "Knowledge Seeker" },
    ];

    for (const badge of badgeThresholds) {
      if (completedCount >= badge.count) {
        await pool.query(`
          INSERT INTO user_badges (user_id, badge_name)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [userId, badge.name]);
      }
    }

    res.json({ message: "Lesson completed, XP added, badge checked." });
  } catch (err) {
    console.error("Lesson completion error:", err.message);
    res.status(500).json({ error: "Server error completing lesson" });
  }
};


// POST: Enroll in course using wallet balance
// exports.enrollInCourse = async (req, res) => {
//   const userId = req.user.id;
//   const courseId = req.params.courseId;

//   try {
//     const [userRes, courseRes] = await Promise.all([
//       pool.query("SELECT wallet_balance FROM users2 WHERE id = $1", [userId]),
//       pool.query("SELECT amount FROM courses WHERE id = $1", [courseId])
//     ]);

//     if (!userRes.rows.length || !courseRes.rows.length) {
//       return res.status(404).json({ error: "User or course not found" });
//     }

//     const wallet = parseFloat(userRes.rows[0].wallet_balance);
//     const amount = parseFloat(courseRes.rows[0].amount);

//     if (wallet < amount) {
//       return res.status(400).json({ error: "Insufficient wallet balance" });
//     }

//     // Check if already enrolled
//     const exists = await pool.query(
//       `SELECT * FROM course_enrollments WHERE user_id = $1 AND course_id = $2`,
//       [userId, courseId]
//     );

//     if (exists.rows.length) {
//       return res.status(400).json({ error: "Already enrolled in course" });
//     }

//     // Deduct and enroll
//     await pool.query("BEGIN");

//     await pool.query(
//       `UPDATE users2 SET wallet_balance = wallet_balance - $1 WHERE id = $2`,
//       [amount, userId]
//     );

//     await pool.query(
//       `INSERT INTO course_enrollments (user_id, course_id, progress) VALUES ($1, $2, 0)`,
//       [userId, courseId]
//     );

//     await pool.query("COMMIT");

//     res.json({ message: "Enrollment successful", newBalance: wallet - amount });
//   } catch (err) {
//     await pool.query("ROLLBACK");
//     console.error("Enrollment error:", err.message);
//     res.status(500).json({ error: "Server error during enrollment" });
//   }
// };

exports.enrollInCourse = async (req, res) => {
  console.log("req.user:", req.user); // 👈 Add this
  const userId = req.user.id;
  const courseId = req.params.courseId;

  try {
    // 1. Check if already enrolled
    const check = await pool.query(
      "SELECT * FROM course_enrollments WHERE user_id = $1 AND course_id = $2",
      [userId, courseId]
    );

    if (check.rows.length > 0) {
      return res.redirect("/student/courses?msg=Already enrolled");
    }

    // 2. Get course info
    const courseRes = await pool.query("SELECT * FROM courses WHERE id = $1", [
      courseId,
    ]);
    const course = courseRes.rows[0];

    if (!course) {
      return res.status(404).send("Course not found.");
    }

    if (course.amount > 0) {
      // 3. Get user wallet
      const userRes = await pool.query(
        "SELECT wallet_balance FROM users2 WHERE id = $1",
        [userId]
      );
      const wallet = userRes.rows[0].wallet_balance;

      if (wallet < course.amount) {
        return res.redirect("/student/dashboard?msg=Insufficient wallet balance");
      }

      // 4. Deduct wallet
      await pool.query(
        "UPDATE users2 SET wallet_balance = wallet_balance - $1 WHERE id = $2",
        [course.amount, userId]
      );
    }

    // 5. Enroll student
    await pool.query(
      "INSERT INTO course_enrollments (user_id, course_id, progress) VALUES ($1, $2, 0)",
      [userId, courseId]
    );

    res.redirect("/student/courses?msg=Enrollment successful");
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).send("Server error");
  }
};

