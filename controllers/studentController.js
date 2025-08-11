const pool = require("../models/db");

// GET: Student Dashboard


// exports.getDashboard = async (req, res) => {
//   const studentId = req.user.id;

//   try {
//     const infoResult = await pool.query(
//       "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
//     );
//     const info = infoResult.rows[0] || {};

//     const profilePic = req.session.user?.profile_picture || null;
//     const walletResult = await pool.query(
//       "SELECT wallet_balance2 FROM users2 WHERE id = $1",
//       [studentId]
//     );
//     const walletBalance = walletResult.rows[0]?.wallet_balance2 || 0;

//     const studentRes = await pool.query("SELECT * FROM users2 WHERE id = $1", [
//       studentId,
//     ]);
//     const student = studentRes.rows[0];

//     // 1️⃣ Get all enrolled courses with pathway
//     const enrolledCoursesRes = await pool.query(
//       `
//       SELECT c.*, p.title AS pathway_name, e.progress
//       FROM course_enrollments e
//       JOIN courses c ON c.id = e.course_id
//       JOIN career_pathways p ON c.career_pathway_id = p.id
//       WHERE e.user_id = $1
//       ORDER BY p.title, c.title
//       `,
//       [studentId]
//     );

//     // 2️⃣ Get all modules for these courses
//     const courseIds = enrolledCoursesRes.rows.map((course) => course.id);
//     let modulesRes = { rows: [] };
//     if (courseIds.length > 0) {
//       modulesRes = await pool.query(
//         `
//         SELECT id, title, course_id, thumbnail
//         FROM modules
//         WHERE course_id = ANY($1)
//         ORDER BY order_number ASC
//         `,
//         [courseIds]
//       );
//     }


//     // Count lessons per module
//     const moduleIds = modulesRes.rows.map((m) => m.id);
//     let lessonCounts = {};
//     if (moduleIds.length > 0) {
//       const countRes = await pool.query(
//         `SELECT module_id, COUNT(*) AS total_lessons
//      FROM lessons
//      WHERE module_id = ANY($1)
//      GROUP BY module_id`,
//         [moduleIds]
//       );
//       countRes.rows.forEach((row) => {
//         lessonCounts[row.module_id] = parseInt(row.total_lessons);
//       });
//     }

//     // 4️⃣ Group courses by pathway & modules by course
//     let pathwayCourses = {};
//     let courseModules = {};

//     for (const course of enrolledCoursesRes.rows) {
//       if (!pathwayCourses[course.pathway_name]) {
//         pathwayCourses[course.pathway_name] = [];
//       }
//       pathwayCourses[course.pathway_name].push(course);
//     }

//     for (const mod of modulesRes.rows) {
//       if (!courseModules[mod.course_id]) {
//         courseModules[mod.course_id] = [];
//       }
//       courseModules[mod.course_id].push(mod);
//     }

//     // 5️⃣ Completed courses
//     const completedCoursesRes = await pool.query(
//       `SELECT COUNT(*) FROM course_enrollments WHERE user_id = $1 AND progress = 100`,
//       [studentId]
//     );
//     const completedCourses = parseInt(completedCoursesRes.rows[0].count);

//     // 6️⃣ Completed projects
//     const completedProjectsRes = await pool.query(
//       `
//       SELECT COUNT(*) FROM course_projects
//       WHERE course_id IN (
//         SELECT course_id FROM course_enrollments WHERE user_id = $1
//       )
//       `,
//       [studentId]
//     );
//     const completedProjects = parseInt(completedProjectsRes.rows[0].count);

//     // 7️⃣ Badges & Certificates
//     const badgesRes = await pool.query(
//       "SELECT * FROM user_badges WHERE user_id = $1",
//       [studentId]
//     );

//     const certificatesRes = await pool.query(
//       `SELECT COUNT(*) FROM course_enrollments WHERE user_id = $1 AND progress = 100`,
//       [studentId]
//     );
//     const certificatesCount = parseInt(certificatesRes.rows[0].count);

//     // 8️⃣ XP History
//     const xpHistoryRes = await pool.query(
//       `SELECT * FROM xp_history WHERE user_id = $1 ORDER BY earned_at DESC LIMIT 10`,
//       [studentId]
//     );

//     // 9️⃣ Weekly engagement
//     const engagementRes = await pool.query(
//       `
//       SELECT
//         TO_CHAR(completed_at, 'Day') AS day,
//         COUNT(*) AS count
//       FROM user_lesson_progress
//       WHERE user_id = $1 AND completed_at >= NOW() - INTERVAL '6 days'
//       GROUP BY day
//       ORDER BY MIN(completed_at)
//       `,
//       [studentId]
//     );

//     const engagementData = {
//       labels: engagementRes.rows.map((r) => r.day.trim()),
//       data: engagementRes.rows.map((r) => parseInt(r.count)),
//     };

//     const selectedPathway = req.query.pathway || null;
//     const section = req.query.section || null;

//     // 🔟 Render with lessons added
//     res.render("student/dashboard", {
//       student,
//       profilePic,
//       isLoggedIn: !!req.session.user,
//       users: req.session.user,
//       info,
//       walletBalance,
//       subscribed: req.query.subscribed,
//       enrolledCourses: enrolledCoursesRes.rows,
//       pathwayCourses,
//       courseModules,
//       // moduleLessons, // ✅ now available in EJS
//       lessonCounts,
//       courses: enrolledCoursesRes.rows,
//       completedCourses,
//       completedProjects,
//       certificatesCount,
//       badges: badgesRes.rows,
//       xpHistory: xpHistoryRes.rows,
//       engagementData,
//       selectedPathway,
//       section,
//     });
//   } catch (err) {
//     console.error("Dashboard Error:", err.message);
//     res.status(500).send("Server Error");
//   }
// };

// exports.getDashboard = async (req, res) => {
//   const studentId = req.user.id;

//   try {
//     // 1️⃣ Company Info
//     const infoResult = await pool.query(
//       "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
//     );
//     const info = infoResult.rows[0] || {};

//     const profilePic = req.session.user?.profile_picture || null;

//     // 2️⃣ Wallet
//     const walletResult = await pool.query(
//       "SELECT wallet_balance2 FROM users2 WHERE id = $1",
//       [studentId]
//     );
//     const walletBalance = walletResult.rows[0]?.wallet_balance2 || 0;

//     // 3️⃣ Student
//     const studentRes = await pool.query("SELECT * FROM users2 WHERE id = $1", [
//       studentId,
//     ]);
//     const student = studentRes.rows[0];

//     // 4️⃣ Enrolled Courses
//     const enrolledCoursesRes = await pool.query(
//       `
//       SELECT c.*, p.title AS pathway_name, e.progress
//       FROM course_enrollments e
//       JOIN courses c ON c.id = e.course_id
//       JOIN career_pathways p ON c.career_pathway_id = p.id
//       WHERE e.user_id = $1
//       ORDER BY p.title, c.title
//       `,
//       [studentId]
//     );

//     // 5️⃣ Modules
//     const courseIds = enrolledCoursesRes.rows.map((c) => c.id);
//     let modulesRes = { rows: [] };
//     if (courseIds.length > 0) {
//       modulesRes = await pool.query(
//         `
//         SELECT id, title, course_id, thumbnail
//         FROM modules
//         WHERE course_id = ANY($1)
//         ORDER BY id ASC
//         `,
//         [courseIds]
//       );
//     }

//     // Lesson counts
//     const moduleIds = modulesRes.rows.map((m) => m.id);
//     let lessonCounts = {};
//     if (moduleIds.length > 0) {
//       const countRes = await pool.query(
//         `SELECT module_id, COUNT(*) AS total_lessons
//          FROM lessons
//          WHERE module_id = ANY($1)
//          GROUP BY module_id`,
//         [moduleIds]
//       );
//       countRes.rows.forEach((row) => {
//         lessonCounts[row.module_id] = parseInt(row.total_lessons);
//       });
      
//     }

//     // Group by pathway & course
//     let pathwayCourses = {};
//     let courseModules = {};
//     for (const course of enrolledCoursesRes.rows) {
//       if (!pathwayCourses[course.pathway_name]) {
//         pathwayCourses[course.pathway_name] = [];
//       }
//       pathwayCourses[course.pathway_name].push(course);
//     }
//     for (const mod of modulesRes.rows) {
//       if (!courseModules[mod.course_id]) {
//         courseModules[mod.course_id] = [];
//       }
//       courseModules[mod.course_id].push(mod);
//     }

//     // 6️⃣ Module Learning Mode
//     const section = req.query.section || null;
//     let moduleInfo = null;
//     let lessons = [];
//     let selectedLesson = null;

//     if (section === "module" && req.query.moduleId) {
//       const moduleId = parseInt(req.query.moduleId);

//       // Module info
//       const moduleRes = await pool.query(
//         "SELECT * FROM modules WHERE id = $1",
//         [moduleId]
//       );
//       moduleInfo = moduleRes.rows[0];

//       // Lessons
//       const lessonsRes = await pool.query(
//         "SELECT * FROM lessons WHERE module_id = $1 ORDER BY id ASC",
//         [moduleId]
//       );
//       lessons = lessonsRes.rows;

//       // Selected lesson
//       let lessonId = req.query.lessonId || (lessons[0] ? lessons[0].id : null);
//       if (lessonId) {
//         const lessonRes = await pool.query(
//           "SELECT * FROM lessons WHERE id = $1",
//           [lessonId]
//         );
//         selectedLesson = lessonRes.rows[0];
//       }
//     }

//     // 7️⃣ Stats
//     const completedCoursesRes = await pool.query(
//       `SELECT COUNT(*) FROM course_enrollments WHERE user_id = $1 AND progress = 100`,
//       [studentId]
//     );
//     const completedCourses = parseInt(completedCoursesRes.rows[0].count);

//     const completedProjectsRes = await pool.query(
//       `
//       SELECT COUNT(*) FROM course_projects
//       WHERE course_id IN (
//         SELECT course_id FROM course_enrollments WHERE user_id = $1
//       )
//       `,
//       [studentId]
//     );
//     const completedProjects = parseInt(completedProjectsRes.rows[0].count);

//     const badgesRes = await pool.query(
//       "SELECT * FROM user_badges WHERE user_id = $1",
//       [studentId]
//     );

//     const certificatesRes = await pool.query(
//       `SELECT COUNT(*) FROM course_enrollments WHERE user_id = $1 AND progress = 100`,
//       [studentId]
//     );
//     const certificatesCount = parseInt(certificatesRes.rows[0].count);

//     const xpHistoryRes = await pool.query(
//       `SELECT * FROM xp_history WHERE user_id = $1 ORDER BY earned_at DESC LIMIT 10`,
//       [studentId]
//     );

//     const engagementRes = await pool.query(
//       `
//       SELECT
//         TO_CHAR(completed_at, 'Day') AS day,
//         COUNT(*) AS count
//       FROM user_lesson_progress
//       WHERE user_id = $1 AND completed_at >= NOW() - INTERVAL '6 days'
//       GROUP BY day
//       ORDER BY MIN(completed_at)
//       `,
//       [studentId]
//     );
//     const engagementData = {
//       labels: engagementRes.rows.map((r) => r.day.trim()),
//       data: engagementRes.rows.map((r) => parseInt(r.count)),
//     };

//     const selectedPathway = req.query.pathway || null;

//     // Render
//     res.render("student/dashboard", {
//       student,
//       profilePic,
//       isLoggedIn: !!req.session.user,
//       users: req.session.user,
//       info,
//       walletBalance,
//       subscribed: req.query.subscribed,
//       enrolledCourses: enrolledCoursesRes.rows,
//       pathwayCourses,
//       courseModules,
//       lessonCounts,
//       courses: enrolledCoursesRes.rows,
//       completedCourses,
//       completedProjects,
//       certificatesCount,
//       badges: badgesRes.rows,
//       xpHistory: xpHistoryRes.rows,
//       engagementData,
//       selectedPathway,
//       section,
//       moduleInfo,
//       lessons,
//       selectedLesson,
//     });
//   } catch (err) {
//     console.error("Dashboard Error:", err.message);
//     res.status(500).send("Server Error");
//   }
// };

// exports.getDashboard = async (req, res) => {
//   const studentId = req.user.id;

//   try {
//     // Company Info
//     const infoResult = await pool.query(
//       "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
//     );
//     const info = infoResult.rows[0] || {};

//     const profilePic = req.session.user?.profile_picture || null;

//     // Wallet
//     const walletResult = await pool.query(
//       "SELECT wallet_balance2 FROM users2 WHERE id = $1",
//       [studentId]
//     );
//     const walletBalance = walletResult.rows[0]?.wallet_balance2 || 0;

//     // Student
//     const studentRes = await pool.query("SELECT * FROM users2 WHERE id = $1", [
//       studentId,
//     ]);
//     const student = studentRes.rows[0];

//     // Enrolled Courses
//     const enrolledCoursesRes = await pool.query(
//       `
//       SELECT c.*, p.title AS pathway_name, e.progress
//       FROM course_enrollments e
//       JOIN courses c ON c.id = e.course_id
//       JOIN career_pathways p ON c.career_pathway_id = p.id
//       WHERE e.user_id = $1
//       ORDER BY p.title, c.title
//       `,
//       [studentId]
//     );

//     // Modules
//     const courseIds = enrolledCoursesRes.rows.map((c) => c.id);
//     let modulesRes = { rows: [] };
//     if (courseIds.length > 0) {
//       modulesRes = await pool.query(
//         `
//         SELECT id, title, course_id, thumbnail
//         FROM modules
//         WHERE course_id = ANY($1)
//         ORDER BY id ASC
//         `,
//         [courseIds]
//       );
//     }

//     // Lessons & quiz indicator
//     const moduleIds = modulesRes.rows.map((m) => m.id);
//     let lessonCounts = {};
//     let moduleLessons = {};
//     if (moduleIds.length > 0) {
//       // Count
//       const countRes = await pool.query(
//         `SELECT module_id, COUNT(*) AS total_lessons
//          FROM lessons
//          WHERE module_id = ANY($1)
//          GROUP BY module_id`,
//         [moduleIds]
//       );
//       countRes.rows.forEach((row) => {
//         lessonCounts[row.module_id] = parseInt(row.total_lessons);
//       });

//       // Lessons with quiz info
//       const lessonsRes = await pool.query(
//         `
//         SELECT l.id, l.title, l.module_id, l.content, l.video_url,
//                EXISTS(SELECT 1 FROM quizzes q WHERE q.lesson_id = l.id) AS has_quiz
//         FROM lessons l
//         WHERE l.module_id = ANY($1)
//         ORDER BY l.id ASC
//       `,
//         [moduleIds]
//       );

//       lessonsRes.rows.forEach((lesson) => {
//         if (!moduleLessons[lesson.module_id])
//           moduleLessons[lesson.module_id] = [];
//         moduleLessons[lesson.module_id].push(lesson);
//       });
//     }

//     // Group by pathway & course
//     let pathwayCourses = {};
//     let courseModules = {};
//     for (const course of enrolledCoursesRes.rows) {
//       if (!pathwayCourses[course.pathway_name]) {
//         pathwayCourses[course.pathway_name] = [];
//       }
//       pathwayCourses[course.pathway_name].push(course);
//     }
//     for (const mod of modulesRes.rows) {
//       if (!courseModules[mod.course_id]) {
//         courseModules[mod.course_id] = [];
//       }
//       courseModules[mod.course_id].push(mod);
//     }

//     // Stats
//     const completedCoursesRes = await pool.query(
//       `SELECT COUNT(*) FROM course_enrollments WHERE user_id = $1 AND progress = 100`,
//       [studentId]
//     );
//     const completedCourses = parseInt(completedCoursesRes.rows[0].count);

//     const completedProjectsRes = await pool.query(
//       `
//       SELECT COUNT(*) FROM course_projects
//       WHERE course_id IN (
//         SELECT course_id FROM course_enrollments WHERE user_id = $1
//       )
//       `,
//       [studentId]
//     );
//     const completedProjects = parseInt(completedProjectsRes.rows[0].count);

//     const badgesRes = await pool.query(
//       "SELECT * FROM user_badges WHERE user_id = $1",
//       [studentId]
//     );

//     const certificatesRes = await pool.query(
//       `SELECT COUNT(*) FROM course_enrollments WHERE user_id = $1 AND progress = 100`,
//       [studentId]
//     );
//     const certificatesCount = parseInt(certificatesRes.rows[0].count);

//     const xpHistoryRes = await pool.query(
//       `SELECT * FROM xp_history WHERE user_id = $1 ORDER BY earned_at DESC LIMIT 10`,
//       [studentId]
//     );

//     const engagementRes = await pool.query(
//       `
//       SELECT
//         TO_CHAR(completed_at, 'Day') AS day,
//         COUNT(*) AS count
//       FROM user_lesson_progress
//       WHERE user_id = $1 AND completed_at >= NOW() - INTERVAL '6 days'
//       GROUP BY day
//       ORDER BY MIN(completed_at)
//       `,
//       [studentId]
//     );
//     const engagementData = {
//       labels: engagementRes.rows.map((r) => r.day.trim()),
//       data: engagementRes.rows.map((r) => parseInt(r.count)),
//     };

//     // Render
//     res.render("student/dashboard", {
//       student,
//       profilePic,
//       isLoggedIn: !!req.session.user,
//       users: req.session.user,
//       info,
//       walletBalance,
//       subscribed: req.query.subscribed,
//       enrolledCourses: enrolledCoursesRes.rows,
//       pathwayCourses,
//       courseModules,
//       moduleLessons, // ✅ for sidebar dropdown
//       lessonCounts,
//       courses: enrolledCoursesRes.rows,
//       completedCourses,
//       completedProjects,
//       certificatesCount,
//       badges: badgesRes.rows,
//       xpHistory: xpHistoryRes.rows,
//       engagementData,
//       selectedPathway: req.query.pathway || null,
//       section: req.query.section || null,
//       moduleInfo: null,
//       lessons: [],
//       selectedLesson: null,
//     });
//   } catch (err) {
//     console.error("Dashboard Error:", err.message);
//     res.status(500).send("Server Error");
//   }
// };


exports.getDashboard = async (req, res) => {
  const studentId = req.user.id;

  try {
    // Company Info
    const infoResult = await pool.query(
      "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
    );
    const info = infoResult.rows[0] || {};

    const profilePic = req.session.user?.profile_picture || null;

    // Wallet
    const walletResult = await pool.query(
      "SELECT wallet_balance2 FROM users2 WHERE id = $1",
      [studentId]
    );
    const walletBalance = walletResult.rows[0]?.wallet_balance2 || 0;

    // Student
    const studentRes = await pool.query("SELECT * FROM users2 WHERE id = $1", [
      studentId,
    ]);
    const student = studentRes.rows[0];

    // Enrolled Courses
    const enrolledCoursesRes = await pool.query(
      `
      SELECT c.*, p.title AS pathway_name, e.progress
      FROM course_enrollments e
      JOIN courses c ON c.id = e.course_id
      JOIN career_pathways p ON c.career_pathway_id = p.id
      WHERE e.user_id = $1
      ORDER BY p.title, c.title
      `,
      [studentId]
    );

    // Modules
    const courseIds = enrolledCoursesRes.rows.map((c) => c.id);
    let modulesRes = { rows: [] };
    if (courseIds.length > 0) {
      modulesRes = await pool.query(
        `
        SELECT id, title, course_id, thumbnail
        FROM modules
        WHERE course_id = ANY($1)
        ORDER BY id ASC
        `,
        [courseIds]
      );
    }

    // Lessons & quiz indicator
    const moduleIds = modulesRes.rows.map((m) => m.id);
    let lessonCounts = {};
    let moduleLessons = {};
    if (moduleIds.length > 0) {
      // Count
      const countRes = await pool.query(
        `SELECT module_id, COUNT(*) AS total_lessons
         FROM lessons
         WHERE module_id = ANY($1)
         GROUP BY module_id`,
        [moduleIds]
      );
      countRes.rows.forEach((row) => {
        lessonCounts[row.module_id] = parseInt(row.total_lessons);
      });

      // Lessons with quiz info
      const lessonsRes = await pool.query(
        `
        SELECT l.id, l.title, l.module_id, l.content, l.video_url,
               EXISTS(SELECT 1 FROM quizzes q WHERE q.lesson_id = l.id) AS has_quiz
        FROM lessons l
        WHERE l.module_id = ANY($1)
        ORDER BY l.id ASC
      `,
        [moduleIds]
      );

      lessonsRes.rows.forEach((lesson) => {
        if (!moduleLessons[lesson.module_id])
          moduleLessons[lesson.module_id] = [];
        moduleLessons[lesson.module_id].push(lesson);
      });
    }

    // Group by pathway & course
    let pathwayCourses = {};
    let courseModules = {};
    for (const course of enrolledCoursesRes.rows) {
      if (!pathwayCourses[course.pathway_name]) {
        pathwayCourses[course.pathway_name] = [];
      }
      pathwayCourses[course.pathway_name].push(course);
    }
    for (const mod of modulesRes.rows) {
      if (!courseModules[mod.course_id]) {
        courseModules[mod.course_id] = [];
      }
      courseModules[mod.course_id].push(mod);
    }

    // Stats
    const completedCoursesRes = await pool.query(
      `SELECT COUNT(*) FROM course_enrollments WHERE user_id = $1 AND progress = 100`,
      [studentId]
    );
    const completedCourses = parseInt(completedCoursesRes.rows[0].count);

    const completedProjectsRes = await pool.query(
      `
      SELECT COUNT(*) FROM course_projects
      WHERE course_id IN (
        SELECT course_id FROM course_enrollments WHERE user_id = $1
      )
      `,
      [studentId]
    );
    const completedProjects = parseInt(completedProjectsRes.rows[0].count);

    const badgesRes = await pool.query(
      "SELECT * FROM user_badges WHERE user_id = $1",
      [studentId]
    );

    const certificatesRes = await pool.query(
      `SELECT COUNT(*) FROM course_enrollments WHERE user_id = $1 AND progress = 100`,
      [studentId]
    );
    const certificatesCount = parseInt(certificatesRes.rows[0].count);

    const xpHistoryRes = await pool.query(
      `SELECT * FROM xp_history WHERE user_id = $1 ORDER BY earned_at DESC LIMIT 10`,
      [studentId]
    );

    const engagementRes = await pool.query(
      `
      SELECT
        TO_CHAR(completed_at, 'Day') AS day,
        COUNT(*) AS count
      FROM user_lesson_progress
      WHERE user_id = $1 AND completed_at >= NOW() - INTERVAL '6 days'
      GROUP BY day
      ORDER BY MIN(completed_at)
      `,
      [studentId]
    );
    const engagementData = {
      labels: engagementRes.rows.map((r) => r.day.trim()),
      data: engagementRes.rows.map((r) => parseInt(r.count)),
    };

    // If viewing a module, load its info and lessons
    let moduleInfo = null;
    let lessons = [];
    let selectedLesson = null;
    if (req.query.section === "module" && req.query.moduleId) {
      const moduleRes = await pool.query(
        `SELECT * FROM modules WHERE id = $1 LIMIT 1`,
        [req.query.moduleId]
      );
      moduleInfo = moduleRes.rows[0] || null;

      const lessonsRes = await pool.query(
        `
        SELECT l.*, EXISTS(SELECT 1 FROM quizzes q WHERE q.lesson_id = l.id) AS has_quiz
        FROM lessons l
        WHERE module_id = $1
        ORDER BY l.id ASC
        `,
        [req.query.moduleId]
      );
      lessons = lessonsRes.rows;

      if (req.query.lessonId) {
        const lessonRes = await pool.query(
          `SELECT * FROM lessons WHERE id = $1 LIMIT 1`,
          [req.query.lessonId]
        );
        selectedLesson = lessonRes.rows[0] || null;
      }
    }

    // Render
    res.render("student/dashboard", {
      student,
      profilePic,
      isLoggedIn: !!req.session.user,
      users: req.session.user,
      info,
      walletBalance,
      subscribed: req.query.subscribed,
      enrolledCourses: enrolledCoursesRes.rows,
      pathwayCourses,
      courseModules,
      moduleLessons,
      lessonCounts,
      courses: enrolledCoursesRes.rows,
      completedCourses,
      completedProjects,
      certificatesCount,
      badges: badgesRes.rows,
      xpHistory: xpHistoryRes.rows,
      engagementData,
      selectedPathway: req.query.pathway || null,
      section: req.query.section || null,
      moduleInfo,
      lessons,
      selectedLesson,
    });
  } catch (err) {
    console.error("Dashboard Error:", err.message);
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

  // 3. Group by pathway → courses → modules
  let pathwayCourses = {}; // { pathwayName: [course1, course2, ...] }
  let courseModules = {}; // { courseId: [module1, module2, ...] }

  for (const course of enrolledCoursesRes.rows) {
    if (!pathwayCourses[course.pathway_name]) {
      pathwayCourses[course.pathway_name] = [];
    }
    pathwayCourses[course.pathway_name].push(course);
  }

  for (const mod of modulesRes.rows) {
    if (!courseModules[mod.course_id]) {
      courseModules[mod.course_id] = [];
    }
    courseModules[mod.course_id].push(mod);
  }

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
      pathwayCourses,
      courseModules,
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
        "SELECT wallet_balance2 FROM users2 WHERE id = $1",
        [userId]
      );
      const wallet = userRes.rows[0].wallet_balance;

      if (wallet < course.amount) {
        return res.redirect("/student/dashboard?msg=Insufficient wallet balance");
      }

      // 4. Deduct wallet
      await pool.query(
        "UPDATE users2 SET wallet_balance2 = wallet_balance2 - $1 WHERE id = $2",
        [course.amount, userId]
      );

      // 4b. Get new wallet balance
      const updatedWalletRes = await pool.query(
        "SELECT wallet_balance FROM users2 WHERE id = $1",
        [userId]
      );
      const newWalletBalance = updatedWalletRes.rows[0]?.wallet_balance;
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

exports.editProfile = async (req, res) => {
  const { fullname, gender, dob } = req.body;
  const profilePic = req.file?.path || req.body.existingPic;

  await pool.query(
    `UPDATE users2 SET fullname = $1, gender = $2, dob = $3, profile_picture = $4 WHERE id = $5`,
    [fullname, gender, dob, profilePic, req.user.id]
  );

  req.session.user.fullname = fullname;
  req.session.user.gender = gender;
  req.session.user.dob = dob;
  req.session.user.profile_picture = profilePic;

  res.redirect("/student/dashboard?section=profile");
};

// exports.viewLesson = async (req, res) => {
//   const lessonId = req.params.lessonId;
//   const studentId = req.user.id;

//   try {
//     const lessonRes = await pool.query(
//       `SELECT l.*, m.title AS module_title, c.title AS course_title
//        FROM lessons l
//        JOIN modules m ON l.module_id = m.id
//        JOIN courses c ON m.course_id = c.id
//        WHERE l.id = $1`,
//       [lessonId]
//     );

//     if (lessonRes.rows.length === 0) {
//       return res.status(404).send("Lesson not found");
//     }

//     const lesson = lessonRes.rows[0];

//     res.render("student/lessonView", {
//       lesson,
//       studentId,
//     });
//   } catch (err) {
//     console.error("Error loading lesson:", err);
//     res.status(500).send("Server error");
//   }
// };

exports.viewLesson = async (req, res) => {
  const lessonId = req.params.lessonId;

  try {
    const lessonRes = await pool.query(
      `SELECT l.*, m.title AS module_title, c.title AS course_title
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE l.id = $1`,
      [lessonId]
    );

    if (lessonRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    const lesson = lessonRes.rows[0];

    res.json({
      success: true,
      id: lesson.id,
      title: lesson.title,
      module_title: lesson.module_title,
      course_title: lesson.course_title,
      video_url: lesson.video_url,
      content: lesson.content,
      has_quiz: !!lesson.quiz_id
    });
  } catch (err) {
    console.error("Error loading lesson:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getModuleDetails = async (req, res) => {
  const moduleId = req.params.moduleId;
  const studentId = req.user.id;

  try {
    const infoResult = await pool.query(
      "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
    );
    const info = infoResult.rows[0] || {};

    const profilePic = req.session.user?.profile_picture || null;
    const walletResult = await pool.query(
      "SELECT wallet_balance2 FROM users2 WHERE id = $1",
      [studentId]
    );
    const walletBalance = walletResult.rows[0]?.wallet_balance2 || 0;
    const moduleRes = await pool.query("SELECT * FROM modules WHERE id = $1", [
      moduleId,
    ]);
    const module = moduleRes.rows[0];
    if (!module) return res.status(404).send("Module not found");

    const lessonsRes = await pool.query(
      `SELECT * FROM lessons WHERE module_id = $1 ORDER BY id ASC`,
      [moduleId]
    );

    res.render("student/moduleDetails", {
      profilePic,
      isLoggedIn: !!req.session.user,
      users: req.session.user,
      info,
      walletBalance,
      subscribed: req.query.subscribed,
      module,
      lessons: lessonsRes.rows,
    });
  } catch (err) {
    console.error("Error loading module:", err.message);
    res.status(500).send("Server error");
  }
};

exports.getLessonQuiz = async (req, res) => {
  const { id } = req.params;
  try {
    const quizRes = await pool.query(
      `SELECT id, question, question_type, options
       FROM quizzes
       WHERE lesson_id = $1
       ORDER BY id ASC`,
      [id]
    );

    if (quizRes.rows.length === 0) {
      return res.json({
        success: false,
        message: "No quiz found for this lesson",
      });
    }

    // Parse JSON options if stored as string
    const questions = quizRes.rows.map((q) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : [],
    }));

    res.json({ success: true, questions });
  } catch (err) {
    console.error("Error fetching quiz:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.submitLessonQuiz = async (req, res) => {
  const { id } = req.params;
  const answers = req.body; // FormData sent from frontend
  const studentId = req.user.id;

  try {
    const quizRes = await pool.query(
      `SELECT id, question, correct_answer, question_type, options
       FROM quizzes
       WHERE lesson_id = $1`,
      [id]
    );

    let score = 0;
    let reviewData = [];

    quizRes.rows.forEach((q) => {
      const yourAnswer = answers[`q${q.id}`];
      const isCorrect =
        yourAnswer &&
        yourAnswer.trim().toLowerCase() ===
          q.correct_answer.trim().toLowerCase();
      if (isCorrect) score++;

      reviewData.push({
        question: q.question,
        yourAnswer,
        correctAnswer: q.correct_answer,
        isCorrect,
      });
    });

    const percentage = Math.round((score / quizRes.rows.length) * 100);
    const passed = percentage >= 50;

    // Get next lesson ID
    const nextLessonRes = await pool.query(
      `SELECT id FROM lessons
       WHERE module_id = (SELECT module_id FROM lessons WHERE id = $1)
       AND id > $1
       ORDER BY id ASC
       LIMIT 1`,
      [id]
    );

    const nextLessonId =
      nextLessonRes.rows.length > 0 ? nextLessonRes.rows[0].id : null;

    res.json({
      success: true,
      score: percentage,
      passed,
      reviewData,
      nextLessonId,
    });
  } catch (err) {
    console.error("Error submitting quiz:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// controllers/studentController.js
exports.getLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const lesson = await Lesson.findByPk(lessonId); // or your DB query
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    res.json({
      id: lesson.id,
      title: lesson.title,
      video_url: lesson.video_url,
      content: lesson.content,
      has_quiz: !!lesson.quiz_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



