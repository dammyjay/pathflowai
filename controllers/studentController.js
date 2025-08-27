const pool = require("../models/db");
// controllers/studentController.js
const { askTutor } = require("../utils/ai");

// GET: Student Dashboard



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

//     // If viewing a module, load its info and lessons
//     let moduleInfo = null;
//     let lessons = [];
//     let selectedLesson = null;
//     if (req.query.section === "module" && req.query.moduleId) {
//       const moduleRes = await pool.query(
//         `SELECT * FROM modules WHERE id = $1 LIMIT 1`,
//         [req.query.moduleId]
//       );
//       moduleInfo = moduleRes.rows[0] || null;

//       const lessonsRes = await pool.query(
//         `
//         SELECT l.*, EXISTS(SELECT 1 FROM quizzes q WHERE q.lesson_id = l.id) AS has_quiz
//         FROM lessons l
//         WHERE module_id = $1
//         ORDER BY l.id ASC
//         `,
//         [req.query.moduleId]
//       );
//       lessons = lessonsRes.rows;

//       if (req.query.lessonId) {
//         const lessonRes = await pool.query(
//           `SELECT * FROM lessons WHERE id = $1 LIMIT 1`,
//           [req.query.lessonId]
//         );
//         selectedLesson = lessonRes.rows[0] || null;
//       }
//     }

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
//       moduleLessons,
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

//     // Modules (all courses by default)
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

//     // If viewing a module, load its info and lessons
//     let moduleInfo = null;
//     let lessons = [];
//     let selectedLesson = null;
//     if (req.query.section === "module" && req.query.moduleId) {
//       const moduleRes = await pool.query(
//         `SELECT * FROM modules WHERE id = $1 LIMIT 1`,
//         [req.query.moduleId]
//       );
//       moduleInfo = moduleRes.rows[0] || null;

//       const lessonsRes = await pool.query(
//         `
//         SELECT l.*, EXISTS(SELECT 1 FROM quizzes q WHERE q.lesson_id = l.id) AS has_quiz
//         FROM lessons l
//         WHERE module_id = $1
//         ORDER BY l.id ASC
//         `,
//         [req.query.moduleId]
//       );
//       lessons = lessonsRes.rows;

//       if (req.query.lessonId) {
//         const lessonRes = await pool.query(
//           `SELECT * FROM lessons WHERE id = $1 LIMIT 1`,
//           [req.query.lessonId]
//         );
//         selectedLesson = lessonRes.rows[0] || null;
//       }

//       if (moduleInfo) {
//         // Only show modules of this course in sidebar
//         const modsRes = await pool.query(
//           `SELECT * FROM modules WHERE course_id = $1 ORDER BY id ASC`,
//           [moduleInfo.course_id]
//         );

//         courseModules = {};
//         courseModules[moduleInfo.course_id] = modsRes.rows;

//         // Only lessons of this course’s modules
//         const moduleIdsForThisCourse = modsRes.rows.map((m) => m.id);
//         if (moduleIdsForThisCourse.length > 0) {
//           const lessonsRes2 = await pool.query(
//             `SELECT * FROM lessons WHERE module_id = ANY($1) ORDER BY id ASC`,
//             [moduleIdsForThisCourse]
//           );

//           moduleLessons = {};
//           lessonsRes2.rows.forEach((lsn) => {
//             if (!moduleLessons[lsn.module_id])
//               moduleLessons[lsn.module_id] = [];
//             moduleLessons[lsn.module_id].push(lsn);
//           });
//         }
//       }
//     }

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
//       moduleLessons,
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
//       // Count lessons per module
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

//     // Default sidebar
//     let sidebarTitle = "All Modules";

//     // If viewing a module, load its info and lessons
//     let moduleInfo = null;
//     let lessons = [];
//     let selectedLesson = null;

//     if (req.query.section === "module" && req.query.moduleId) {
//       const moduleRes = await pool.query(
//         `SELECT * FROM modules WHERE id = $1 LIMIT 1`,
//         [req.query.moduleId]
//       );
//       moduleInfo = moduleRes.rows[0] || null;

//       if (moduleInfo) {
//         // Replace sidebar with course title
//         const courseRes = await pool.query(
//           `SELECT title FROM courses WHERE id = $1 LIMIT 1`,
//           [moduleInfo.course_id]
//         );
//         const courseTitle = courseRes.rows[0]?.title || "Modules";
//         sidebarTitle = courseTitle;

//         // Restrict modules only to this course
//         const modsRes = await pool.query(
//           `SELECT * FROM modules WHERE course_id = $1 ORDER BY id ASC`,
//           [moduleInfo.course_id]
//         );

//         courseModules = {};
//         courseModules[moduleInfo.course_id] = modsRes.rows;

//         // Lessons for modules in this course
//         const moduleIdsForThisCourse = modsRes.rows.map((m) => m.id);
//         if (moduleIdsForThisCourse.length > 0) {
//           const lessonsRes2 = await pool.query(
//             `SELECT * FROM lessons WHERE module_id = ANY($1) ORDER BY id ASC`,
//             [moduleIdsForThisCourse]
//           );

//           moduleLessons = {};
//           lessonsRes2.rows.forEach((lsn) => {
//             if (!moduleLessons[lsn.module_id])
//               moduleLessons[lsn.module_id] = [];
//             moduleLessons[lsn.module_id].push(lsn);
//           });
//         }

//         // If a specific lesson is requested
//         if (req.query.lessonId) {
//           const lessonRes = await pool.query(
//             `SELECT * FROM lessons WHERE id = $1 LIMIT 1`,
//             [req.query.lessonId]
//           );
//           selectedLesson = lessonRes.rows[0] || null;
//         }
//       }
//     }

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
//       moduleLessons,
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
//       moduleInfo,
//       lessons,
//       selectedLesson,
//       sidebarTitle, // 👈 now available in EJS
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

    // --- Fetch assignments for each module ---
    let moduleAssignments = {};
    if (moduleIds.length > 0) {
      const assignmentsRes = await pool.query(
        `
    SELECT a.*, m.title AS module_title
    FROM module_assignments a
    JOIN modules m ON a.module_id = m.id
    WHERE a.module_id = ANY($1)
    ORDER BY a.id ASC
    `,
        [moduleIds]
      );

      assignmentsRes.rows.forEach((assign) => {
        if (!moduleAssignments[assign.module_id])
          moduleAssignments[assign.module_id] = [];
        moduleAssignments[assign.module_id].push(assign);
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

      // 🎯 Filter modules/lessons to only this course
      if (moduleInfo) {
        const modsRes = await pool.query(
          `SELECT * FROM modules WHERE course_id = $1 ORDER BY id ASC`,
          [moduleInfo.course_id]
        );
        courseModules = { [moduleInfo.course_id]: modsRes.rows };

        const moduleIdsForThisCourse = modsRes.rows.map((m) => m.id);
        if (moduleIdsForThisCourse.length > 0) {
          const lessonsRes2 = await pool.query(
            `SELECT * FROM lessons WHERE module_id = ANY($1) ORDER BY id ASC`,
            [moduleIdsForThisCourse]
          );
          moduleLessons = {};
          lessonsRes2.rows.forEach((lsn) => {
            if (!moduleLessons[lsn.module_id])
              moduleLessons[lsn.module_id] = [];
            moduleLessons[lsn.module_id].push(lsn);
          });
        }
      }
    }

    // If viewing a pathway
    if (req.query.pathway && pathwayCourses[req.query.pathway]) {
      pathwayCourses = {
        [req.query.pathway]: pathwayCourses[req.query.pathway],
      };

      const allowedCourseIds = pathwayCourses[req.query.pathway].map(
        (c) => c.id
      );
      courseModules = Object.fromEntries(
        Object.entries(courseModules).filter(([courseId]) =>
          allowedCourseIds.includes(parseInt(courseId))
        )
      );
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
      moduleAssignments, // <--- new
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

// exports.getLessonQuiz = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const quizRes = await pool.query(
//       `SELECT id, question, question_type, options
//        FROM quizzes
//        WHERE lesson_id = $1
//        ORDER BY id ASC`,
//       [id]
//     );

//     if (quizRes.rows.length === 0) {
//       return res.json({
//         success: false,
//         message: "No quiz found for this lesson",
//       });
//     }

//     // Parse JSON options if stored as string
//     const questions = quizRes.rows.map((q) => ({
//       ...q,
//       options: q.options ? JSON.parse(q.options) : [],
//     }));

//     res.json({ success: true, questions });
//   } catch (err) {
//     console.error("Error fetching quiz:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

exports.getLessonQuiz = async (req, res) => {
  const lessonId = req.params.id;

  try {
    // Get quiz id(s) for this lesson
    const quizRes = await pool.query(
      `SELECT id FROM quizzes WHERE lesson_id = $1`,
      [lessonId]
    );

    if (quizRes.rows.length === 0) {
      return res.json({
        success: false,
        message: "No quiz found for this lesson",
      });
    }

    const quizId = quizRes.rows[0].id;

    // Get questions for this quiz
    const questionsRes = await pool.query(
      `SELECT id, question, question_type, options
       FROM quiz_questions
       WHERE quiz_id = $1
       ORDER BY id ASC`,
      [quizId]
    );

    if (questionsRes.rows.length === 0) {
      return res.json({
        success: false,
        message: "No quiz questions found for this lesson",
      });
    }

    const questions = questionsRes.rows.map((q) => {
      let options = [];
      if (q.options) {
        if (Array.isArray(q.options)) {
          options = q.options;
        } else if (typeof q.options === "string") {
          // Split by comma and trim whitespace
          options = q.options.split(",").map(opt => opt.trim());
        }
      }
      return {
        ...q,
        options,
      };
    });

    res.json({ success: true, questions });
  } catch (err) {
    console.error("Error fetching quiz:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// exports.submitLessonQuiz = async (req, res) => {
//   try {
//     const lessonId = req.params.id;
//     const answers = req.body;

//     // ✅ Fetch lesson content
//     const lessonRes = await pool.query(
//       `SELECT id, title, content FROM lessons WHERE id=$1`,
//       [lessonId]
//     );
//     if (lessonRes.rows.length === 0) {
//       return res.status(404).json({ error: "Lesson not found" });
//     }
//     const lesson = lessonRes.rows[0];

//     // ✅ Fetch quiz questions
//     const qRes = await pool.query(
//       `SELECT qq.id, qq.question, qq.options, qq.correct_option
//        FROM quiz_questions qq
//        JOIN quizzes q ON q.id = qq.quiz_id
//        WHERE q.lesson_id = $1`,
//       [lessonId]
//     );
//     const questions = qRes.rows;
//     if (questions.length === 0) {
//       return res.json({ success: false, message: "No quiz found." });
//     }

//     // ✅ Score student answers
//     let score = 0;
//     const reviewData = [];
//     questions.forEach((q) => {
//       const yourAnswer = answers[`q${q.id}`] || "";
//       const isCorrect =
//         yourAnswer.toString().trim().toLowerCase() ===
//         q.correct_option.toString().trim().toLowerCase();

//       if (isCorrect) score++;

//       reviewData.push({
//         id: q.id,
//         question: q.question,
//         yourAnswer,
//         correctAnswer: q.correct_option,
//         isCorrect,
//       });
//     });

//     const percent = Math.round((score / questions.length) * 100);

//     // ✅ AI Prompt WITH lesson content
//     const feedbackPrompt = `
// You are an AI tutor. Use the following LESSON CONTENT to explain quiz answers:

// "${lesson.content}"

// Now here is a student's quiz attempt for the lesson "${lesson.title}":

// ${reviewData
//   .map(
//     (r, i) =>
//       `Q${i + 1}: ${r.question}
// Student answered: ${r.yourAnswer || "No answer"}
// Correct answer: ${r.correctAnswer}
// Result: ${r.isCorrect ? "✅ Correct" : "❌ Wrong"}`
//   )
//   .join("\n\n")}

// TASK:
// For EACH question (correct OR wrong):
// - If correct → give a short reinforcement explanation from the lesson.
// - If wrong → explain why their answer is incorrect AND what the correct answer means (2–3 sentences).
// - Always base your explanation on the LESSON CONTENT.
// - Be supportive and encouraging.

// OUTPUT:
// Return only JSON in this format:
// [
//   { "questionId": 12, "feedback": "..." },
//   { "questionId": 15, "feedback": "..." }
// ]
// `;

//     let perQuestionFeedback = [];
//     try {
//       const raw = await askTutor({ question: feedbackPrompt });

//       // Extract JSON safely
//       const jsonMatch = raw.match(/\[[\s\S]*\]/);
//       if (jsonMatch) {
//         perQuestionFeedback = JSON.parse(jsonMatch[0]);
//       } else {
//         console.warn("⚠️ AI returned non-JSON, raw:", raw);
//       }
//     } catch (err) {
//       console.error("AI per-question feedback error:", err.message);
//     }

//     // ✅ Attach AI feedback
//     reviewData.forEach((r) => {
//       const fb = perQuestionFeedback.find((f) => f.questionId == r.id);
//       r.feedback = fb
//         ? fb.feedback
//         : r.isCorrect
//         ? "✅ Correct! Great understanding."
//         : "❌ Incorrect. Review the lesson content.";
//     });

//     res.json({
//       success: true,
//       score: percent,
//       passed: percent >= 50,
//       reviewData,
//       feedback:
//         percent >= 80
//           ? "🌟 Excellent work! You clearly understood this lesson."
//           : percent >= 50
//           ? "👍 Good attempt. Review the explanations for the wrong answers."
//           : "📘 Don’t worry! Revisit the lesson content and try again.",
//     });
//   } catch (err) {
//     console.error("Quiz submit error:", err.message);
//     res.status(500).json({ success: false, message: "Failed to submit quiz." });
//   }
// };

exports.submitLessonQuiz = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const answers = req.body;

    // ✅ Fetch lesson content
    const lessonRes = await pool.query(
      `SELECT id, title, content FROM lessons WHERE id=$1`,
      [lessonId]
    );
    if (lessonRes.rows.length === 0) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    const lesson = lessonRes.rows[0];

    // ✅ Fetch quiz questions
    const qRes = await pool.query(
      `SELECT qq.id, qq.question, qq.options, qq.correct_option
       FROM quiz_questions qq
       JOIN quizzes q ON q.id = qq.quiz_id
       WHERE q.lesson_id = $1`,
      [lessonId]
    );
    const questions = qRes.rows;
    if (questions.length === 0) {
      return res.json({ success: false, message: "No quiz found." });
    }

    // ✅ Score student answers
    let score = 0;
    const reviewData = [];
    questions.forEach((q) => {
      const yourAnswer = answers[`q${q.id}`] || "";
      const isCorrect =
        yourAnswer.toString().trim().toLowerCase() ===
        q.correct_option.toString().trim().toLowerCase();

      if (isCorrect) score++;

      reviewData.push({
        id: q.id, // real DB id
        question: q.question,
        yourAnswer,
        correctAnswer: q.correct_option,
        isCorrect,
      });
    });

    const percent = Math.round((score / questions.length) * 100);

    // ✅ AI Prompt WITH lesson content + real IDs
    const feedbackPrompt = `
You are an AI tutor. Use the following LESSON CONTENT to explain quiz answers:

"${lesson.content}"

Now here is a student's quiz attempt for the lesson "${lesson.title}":

${reviewData
  .map(
    (r) =>
      `QuestionId: ${r.id}
Question: ${r.question}
Student answered: ${r.yourAnswer || "No answer"}
Correct answer: ${r.correctAnswer}
Result: ${r.isCorrect ? "✅ Correct" : "❌ Wrong"}`
  )
  .join("\n\n")}

TASK:
For EACH question (correct OR wrong):
- Use the QuestionId from above in the JSON.
- If correct → give a short reinforcement explanation from the lesson.
- If wrong → explain why their answer is incorrect AND what the correct answer means (2–3 sentences).
- Always base explanations on the LESSON CONTENT.
- Be supportive and encouraging.

OUTPUT:
Return only valid JSON in this format:
[
  { "questionId": 12, "feedback": "..." },
  { "questionId": 15, "feedback": "..." }
]
`;

    let perQuestionFeedback = [];
    try {
      const raw = await askTutor({ question: feedbackPrompt });

      // Extract JSON safely
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        perQuestionFeedback = JSON.parse(jsonMatch[0]);
      } else {
        console.warn("⚠️ AI returned non-JSON, raw:", raw);
      }
    } catch (err) {
      console.error("AI per-question feedback error:", err.message);
    }

    // ✅ Attach AI feedback correctly by real ID
    reviewData.forEach((r) => {
      const fb = perQuestionFeedback.find((f) => f.questionId == r.id);
      r.feedback = fb
        ? fb.feedback
        : r.isCorrect
        ? "✅ Correct! Great understanding."
        : "❌ Incorrect. Review the lesson content.";
    });

    res.json({
      success: true,
      score: percent,
      passed: percent >= 50,
      reviewData,
      feedback:
        percent >= 80
          ? "🌟 Excellent work! You clearly understood this lesson."
          : percent >= 50
          ? "👍 Good attempt. Review the explanations for the wrong answers."
          : "📘 Don’t worry! Revisit the lesson content and try again.",
    });
  } catch (err) {
    console.error("Quiz submit error:", err.message);
    res.status(500).json({ success: false, message: "Failed to submit quiz." });
  }
};



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



// POST /student/ai/ask
exports.askAITutor = async (req, res) => {
  try {
    const userId = req.user?.id || req.session.user?.id;
    const { question, lessonId } = req.body;

    // Pull a little lesson context if provided (title + content)
    let lessonContext = "";
    if (lessonId) {
      const ctx = await pool.query(
        `SELECT title, content FROM lessons WHERE id = $1 LIMIT 1`,
        [lessonId]
      );
      if (ctx.rows[0]) {
        lessonContext = `Title: ${ctx.rows[0].title}\n\n${ctx.rows[0].content || ""}`;
      }
    }

    const userName = req.session?.user?.fullname || "Student";
    const answer = await askTutor({ question, lessonContext, userName });

    // (Optional) Persist chat logs
    // await pool.query(
    //   `INSERT INTO ai_tutor_logs (user_id, lesson_id, question, answer)
    //    VALUES ($1,$2,$3,$4)`,
    //   [userId || null, lessonId || null, question, answer]
    // );

    res.json({ ok: true, answer });
  } catch (e) {
    console.error("AI tutor error:", e.message);
    res.status(500).json({ ok: false, error: "Tutor is unavailable." });
  }
};


// exports.viewAssignment = async (req, res) => {
//   try {
//     const assignmentId = req.params.id;

//     const result = await pool.query(
//       `SELECT ma.*, m.title AS module_title, c.title AS course_title
//        FROM module_assignments ma
//        JOIN modules m ON ma.module_id = m.id
//        JOIN courses c ON m.course_id = c.id
//        WHERE ma.id = $1`,
//       [assignmentId]
//     );

//     if (result.rows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Assignment not found" });
//     }

//     const assignment = result.rows[0];

//     res.json({
//       success: true,
//       id: assignment.id,
//       title: assignment.title,
//       instructions: assignment.instructions,
//       due_date: assignment.due_date,
//       module_title: assignment.module_title,
//       course_title: assignment.course_title,
//     });
//   } catch (err) {
//     console.error("View assignment error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

exports.viewAssignment = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);
    const studentId = req.session.student?.id; // adjust if you use JWT or req.user

    if (isNaN(assignmentId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid assignment ID" });
    }

    // ✅ Fetch assignment
    const result = await pool.query(
      `SELECT ma.*, m.title AS module_title, c.title AS course_title
       FROM module_assignments ma
       JOIN modules m ON ma.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE ma.id = $1`,
      [assignmentId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }
    const assignment = result.rows[0];

    // ✅ Check if student already submitted
    const subRes = await pool.query(
      `SELECT id, description, file_url, score, grade, feedback, created_at
       FROM assignment_submissions
       WHERE assignment_id = $1 AND student_id = $2
       ORDER BY created_at DESC LIMIT 1`,
      [assignmentId, studentId]
    );

    if (subRes.rows.length > 0) {
      // already submitted
      return res.json({
        success: true,
        submitted: true,
        assignment: {
          id: assignment.id,
          title: assignment.title,
          instructions: assignment.instructions,
          due_date: assignment.due_date,
          module_title: assignment.module_title,
          course_title: assignment.course_title,
        },
        submission: subRes.rows[0],
      });
    }

    // no submission yet
    res.json({
      success: true,
      submitted: false,
      assignment: {
        id: assignment.id,
        title: assignment.title,
        instructions: assignment.instructions,
        due_date: assignment.due_date,
        module_title: assignment.module_title,
        course_title: assignment.course_title,
      },
    });
  } catch (err) {
    console.error("View assignment error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ✅ Student submits an assignment
// exports.submitAssignment = async (req, res) => {
//   try {
//     const { assignmentId, description } = req.body;
//     const studentId = req.user?.id || req.session.user?.id;

//     if (!assignmentId || !description) {
//       return res.status(400).json({ success: false, message: "Assignment ID and description are required." });
//     }

//     // ✅ Fetch assignment instructions from module_assignment
//     const aRes = await pool.query(
//       `SELECT id, title, instructions
//        FROM module_assignments
//        WHERE id = $1`,
//       [assignmentId]
//     );

//     if (aRes.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "Assignment not found." });
//     }

//     const assignment = aRes.rows[0];

//     // ✅ Build AI grading prompt
//     const gradingPrompt = `
// You are an AI tutor grading a student's assignment.

// Assignment Title: "${assignment.title}"
// Assignment Instructions:
// ${assignment.instructions}

// Student Submission:
// ${description}

// TASK:
// 1. Compare the student's submission to the assignment instructions.
// 2. Grade fairly on a scale of 0 to 100.
// 3. Provide detailed feedback:
//    - What was done well.
//    - What was missing or incorrect.
//    - Suggestions for improvement.
// 4. Be supportive and encouraging.

// OUTPUT:
// Return valid JSON in this format:
// {
//   "score": 85,
//   "feedback": "Your submission covered the basics of X, but you missed Y. Great effort overall!"
// }
// `;

//     // ✅ Ask AI for grading
//     let score = null;
//     let feedbackText = "Feedback unavailable.";
//     try {
//       const raw = await askTutor({ question: gradingPrompt });

//       const jsonMatch = raw.match(/\{[\s\S]*\}/);
//       if (jsonMatch) {
//         const parsed = JSON.parse(jsonMatch[0]);
//         score = parsed.score || null;
//         feedbackText = parsed.feedback || feedbackText;
//       } else {
//         console.warn("⚠️ AI returned non-JSON:", raw);
//       }
//     } catch (err) {
//       console.error("AI grading error:", err.message);
//     }

//     // ✅ Save submission into DB
//     const insertRes = await pool.query(
//       `INSERT INTO assignment_submissions
//        (assignment_id, student_id, description, score, ai_feedback)
//        VALUES ($1, $2, $3, $4, $5)
//        RETURNING *`,
//       [assignmentId, studentId, description, score, feedbackText]
//     );

//     res.json({
//       success: true,
//       message: "Assignment submitted successfully.",
//       submission: insertRes.rows[0]
//     });
//   } catch (err) {
//     console.error("Assignment submit error:", err.message);
//     res.status(500).json({ success: false, message: "Failed to submit assignment." });
//   }
// };

// StudentController.js
// exports.submitAssignment = async (req, res) => {
//   try {
//     const { assignmentId, description } = req.body;
//     if (!assignmentId || !description) {
//       return res.status(400).json({ success: false, message: "Assignment ID and description are required." });
//     }

//     // Handle optional file
//     let fileUrl = null;
//     if (req.file) {
//       fileUrl = `/uploads/${req.file.filename}`; // adjust if Cloudinary or other storage
//     }

//     // ✅ Get assignment instructions
//     const aRes = await pool.query(
//       `SELECT ma.id, ma.title, ma.instructions, m.title AS module_title, c.title AS course_title
//        FROM module_assignment ma
//        JOIN modules m ON ma.module_id = m.id
//        JOIN courses c ON m.course_id = c.id
//        WHERE ma.id = $1`,
//       [assignmentId]
//     );
//     if (aRes.rows.length === 0) {
//       return res.status(404).json({ success: false, message: "Assignment not found." });
//     }
//     const assignment = aRes.rows[0];

//     // ✅ Store submission in DB
//     const subRes = await pool.query(
//       `INSERT INTO assignment_submissions (assignment_id, student_id, description, file_url)
//        VALUES ($1, $2, $3, $4)
//        RETURNING id`,
//       [assignmentId, req.user.id, description, fileUrl]
//     );
//     const submissionId = subRes.rows[0].id;

//     // ✅ AI prompt to grade the assignment
//     const gradingPrompt = `
// You are an AI tutor. Grade the student's assignment based on the assignment instructions.

// Assignment Title: "${assignment.title}"
// Instructions: "${assignment.instructions}"

// Student Submission:
// "${description}"

// TASK:
// 1. Provide a score between 0–100.
// 2. Suggest a grade (A, B, C, D, F).
// 3. Give a detailed but encouraging feedback (3–6 sentences).
// 4. Highlight both strengths and areas for improvement.

// Return only valid JSON like this:
// {
//   "score": 85,
//   "grade": "B+",
//   "feedback": "Your analysis was strong, especially in section 1..."
// }
// `;

//     let score = null;
//     let grade = null;
//     let ai_feedback = null;

//     try {
//       const raw = await askTutor({ question: gradingPrompt });
//       const jsonMatch = raw.match(/\{[\s\S]*\}/);
//       if (jsonMatch) {
//         const parsed = JSON.parse(jsonMatch[0]);
//         score = parsed.score || null;
//         grade = parsed.grade || null;
//         ai_feedback = parsed.feedback || null;
//       } else {
//         ai_feedback = "⚠️ AI could not generate feedback.";
//       }
//     } catch (err) {
//       console.error("AI grading error:", err.message);
//       ai_feedback = "⚠️ Error while grading assignment.";
//     }

//     // ✅ Update DB with AI grading
//     await pool.query(
//       `UPDATE assignment_submissions
//        SET score=$1, grade=$2, feedback=$3
//        WHERE id=$4`,
//       [score, grade, ai_feedback, submissionId]
//     );

//     // ✅ Return response to frontend
//     res.json({
//       success: true,
//       message: "Assignment submitted successfully",
//       score,
//       grade,
//       ai_feedback
//     });

//   } catch (err) {
//     console.error("Assignment submit error:", err.message);
//     res.status(500).json({ success: false, message: "Failed to submit assignment." });
//   }
// };

exports.submitAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId || req.body.assignmentId;

    // ✅ Try different sources for studentId
    let studentId =
      req.session?.student?.id || req.user?.id || req.body.studentId;
    const { description } = req.body;
    const file = req.file ? req.file.path : null; // multer file path

    if (!assignmentId || !description) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID and description are required.",
      });
    }

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID missing. Please log in again.",
      });
    }

    // ✅ Check assignment exists
    const aRes = await pool.query(
      `SELECT id, title, instructions FROM module_assignments WHERE id=$1`,
      [assignmentId]
    );
    if (aRes.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found." });
    }
    const assignment = aRes.rows[0];

    // ✅ Save submission
    const save = await pool.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, description, file_url)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [assignmentId, studentId, description, file]
    );
    const submission = save.rows[0];

    // ✅ AI grading
    const gradingPrompt = `
You are an AI tutor. A student submitted an assignment.

ASSIGNMENT TITLE: ${assignment.title}
INSTRUCTIONS: ${assignment.instructions}

STUDENT SUBMISSION:
"${description}"

TASK:
- Grade the submission based on instructions.
- Give a score out of 100.
- Assign a grade (A, B, C, D, F).
- Provide constructive, encouraging feedback (3–5 sentences).

OUTPUT:
Return only JSON:
{
  "score": 85,
  "grade": "B",
  "ai_feedback": "..."
}
`;

    let score = null,
      grade = null,
      feedback = null;

    try {
      const raw = await askTutor({ question: gradingPrompt });
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        score = parsed.score;
        grade = parsed.grade;
        feedback = parsed.feedback;
      }
    } catch (err) {
      console.error("AI grading failed:", err.message);
      feedback = "AI grading unavailable. Your assignment has been submitted.";
    }

    // ✅ Update submission with grading
    await pool.query(
      `UPDATE assignment_submissions
       SET score=$1, grade=$2, ai_feedback=$3
       WHERE id=$4`,
      [score, grade, feedback, submission.id]
    );

    res.json({
      success: true,
      message: "Assignment submitted and graded ✅",
      submissionId: submission.id,
      score,
      grade,
      feedback,
    });
  } catch (err) {
    console.error("Assignment submit error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit assignment" });
  }
};


// StudentController.js
exports.getMyAssignments = async (req, res) => {
  try {
    const submissions = await pool.query(
      `SELECT s.id, s.assignment_id, s.description, s.file_url, 
              s.score, s.grade, s.feedback, s.submitted_at,
              ma.title AS assignment_title, ma.instructions,
              m.title AS module_title, c.title AS course_title
       FROM assignment_submissions s
       JOIN module_assignment ma ON s.assignment_id = ma.id
       JOIN modules m ON ma.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE s.student_id = $1
       ORDER BY s.submitted_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, submissions: submissions.rows });
  } catch (err) {
    console.error("Fetch submissions error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch submissions" });
  }
};


exports.getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await pool.query(
      `SELECT s.*, 
              ma.title AS assignment_title, ma.instructions,
              m.title AS module_title, c.title AS course_title
       FROM assignment_submissions s
       JOIN module_assignment ma ON s.assignment_id = ma.id
       JOIN modules m ON ma.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE s.id = $1 AND s.student_id = $2`,
      [id, req.user.id]
    );

    if (sub.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }

    res.json({ success: true, submission: sub.rows[0] });
  } catch (err) {
    console.error("Fetch single submission error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to load submission" });
  }
};






