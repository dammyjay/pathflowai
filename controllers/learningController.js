const pool = require("../models/db");

exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, level } = req.body;

  try {
    await pool.query(
      "UPDATE courses SET title = $1, description = $2, level = $3 WHERE id = $4",
      [title, description, level, id]
    );
    res.redirect(`/admin/courses/${id}?tab=details`);
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).send("Server Error");
  }
};

// -------------------- MODULES --------------------
exports.createModule = async (req, res) => {
  const { title, course_id } = req.body;
  try {
    await pool.query("INSERT INTO modules (title, course_id) VALUES ($1, $2)", [
      title,
      course_id,
    ]);
    res.redirect(`/admin/courses/${course_id}?tab=modules`);
  } catch (err) {
    console.error("Error creating module:", err);
    res.status(500).send("Server error");
  }
};

exports.editModule = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  try {
    await pool.query("UPDATE modules SET title = $1 WHERE id = $2", [
      title,
      id,
    ]);
    res.redirect("back");
  } catch (err) {
    console.error("Error editing module:", err);
    res.status(500).send("Server error");
  }
};

exports.deleteModule = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM modules WHERE id = $1", [id]);
    res.redirect("back");
  } catch (err) {
    console.error("Error deleting module:", err);
    res.status(500).send("Server error");
  }
};

// -------------------- LESSONS --------------------
exports.createLesson = async (req, res) => {
  const { title, content, module_id } = req.body;
  try {
    await pool.query(
      "INSERT INTO lessons (title, content, module_id) VALUES ($1, $2, $3)",
      [title, content, module_id]
    );
    res.redirect("back");
  } catch (err) {
    console.error("Error creating lesson:", err);
    res.status(500).send("Server error");
  }
};

exports.editLesson = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    await pool.query(
      "UPDATE lessons SET title = $1, content = $2 WHERE id = $3",
      [title, content, id]
    );
    res.redirect("back");
  } catch (err) {
    console.error("Error editing lesson:", err);
    res.status(500).send("Server error");
  }
};

exports.deleteLesson = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM lessons WHERE id = $1", [id]);
    res.redirect("back");
  } catch (err) {
    console.error("Error deleting lesson:", err);
    res.status(500).send("Server error");
  }
};

// -------------------- QUIZZES --------------------
exports.createQuiz = async (req, res) => {
  const { title, lesson_id } = req.body;
  try {
    await pool.query("INSERT INTO quizzes (title, lesson_id) VALUES ($1, $2)", [
      title,
      lesson_id,
    ]);
    res.redirect("back");
  } catch (err) {
    console.error("Error creating quiz:", err);
    res.status(500).send("Server error");
  }
};

exports.addQuizQuestion = async (req, res) => {
  const { quiz_id, question, options, correct_answer } = req.body;
  try {
    await pool.query(
      "INSERT INTO quiz_questions (quiz_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)",
      [quiz_id, question, JSON.stringify(options), correct_answer]
    );
    res.redirect("back");
  } catch (err) {
    console.error("Error adding quiz question:", err);
    res.status(500).send("Server error");
  }
};

exports.deleteQuiz = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM quizzes WHERE id = $1", [id]);
    res.redirect("back");
  } catch (err) {
    console.error("Error deleting quiz:", err);
    res.status(500).send("Server error");
  }
};

exports.deleteQuizQuestion = async (req, res) => {
  const { quizId, questionId } = req.params;
  try {
    await pool.query(
      "DELETE FROM quiz_questions WHERE id = $1 AND quiz_id = $2",
      [questionId, quizId]
    );
    res.redirect("back");
  } catch (err) {
    console.error("Error deleting quiz question:", err);
    res.status(500).send("Server error");
  }
};

// -------------------- ASSIGNMENTS --------------------
exports.createAssignment = async (req, res) => {
  const { title, content, lesson_id, module_id, course_id } = req.body;
  try {
    let field, id;
    if (lesson_id) {
      field = "lesson_id";
      id = lesson_id;
    } else if (module_id) {
      field = "module_id";
      id = module_id;
    } else if (course_id) {
      field = "course_id";
      id = course_id;
    }

    await pool.query(
      `INSERT INTO assignments (title, content, ${field}) VALUES ($1, $2, $3)`,
      [title, content, id]
    );
    res.redirect("back");
  } catch (err) {
    console.error("Error creating assignment:", err);
    res.status(500).send("Server error");
  }
};

exports.editAssignment = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    await pool.query(
      "UPDATE assignments SET title = $1, content = $2 WHERE id = $3",
      [title, content, id]
    );
    res.redirect("back");
  } catch (err) {
    console.error("Error editing assignment:", err);
    res.status(500).send("Server error");
  }
};

exports.deleteAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM assignments WHERE id = $1", [id]);
    res.redirect("back");
  } catch (err) {
    console.error("Error deleting assignment:", err);
    res.status(500).send("Server error");
  }
};

// -------------------- PROJECTS --------------------
exports.createProject = async (req, res) => {
  const { title, description, course_id } = req.body;
  try {
    await pool.query(
      "INSERT INTO projects (title, description, course_id) VALUES ($1, $2, $3)",
      [title, description, course_id]
    );
    res.redirect("back");
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).send("Server error");
  }
};

exports.editProject = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  try {
    await pool.query(
      "UPDATE projects SET title = $1, description = $2 WHERE id = $3",
      [title, description, id]
    );
    res.redirect("back");
  } catch (err) {
    console.error("Error editing project:", err);
    res.status(500).send("Server error");
  }
};

exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM projects WHERE id = $1", [id]);
    res.redirect("back");
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).send("Server error");
  }
};

// SINGLE COURSE PAGE
exports.getSingleCourse = async (req, res) => {
  const courseId = req.params.id;
  const course = await pool.query(`SELECT * FROM courses WHERE id = $1`, [
    courseId,
  ]);
  const modules = await pool.query(
    `SELECT * FROM modules WHERE course_id = $1`,
    [courseId]
  );
  const lessons = await pool.query(
    `
    SELECT l.*, m.title as module_title 
    FROM lessons l JOIN modules m ON l.module_id = m.id 
    WHERE m.course_id = $1`,
    [courseId]
  );
  const assignment = await pool.query(
    `SELECT * FROM course_assignments WHERE course_id = $1`,
    [courseId]
  );
  const project = await pool.query(
    `SELECT * FROM course_projects WHERE course_id = $1`,
    [courseId]
  );
  const quiz = await pool.query(`SELECT * FROM quiz WHERE course_id = $1`, [
    courseId,
  ]);

  res.render("admin/singleCourse", {
    course: course.rows[0],
    modules: modules.rows,
    lessons: lessons.rows,
    quiz: quiz.rows,
    assignment: assignment.rows,
    project: project.rows,
    activeTab: req.query.tab || "details",
  });
};

// exports.viewSingleCourse = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const courseResult = await pool.query(
//       "SELECT * FROM courses WHERE id = $1",
//       [id]
//     );
//     const course = courseResult.rows[0];

//     if (!course) {
//       return res.status(404).send("Course not found");
//     }

//     const modules = await pool.query(
//       "SELECT * FROM modules WHERE course_id = $1 ORDER BY sort_order ASC",
//       [id]
//     );
//     const assignments = await pool.query(
//       "SELECT * FROM assignments WHERE course_id = $1",
//       [id]
//     );
//     const projects = await pool.query(
//       "SELECT * FROM projects WHERE course_id = $1",
//       [id]
//     );

//     // Render the single course page
//     res.render("admin/singleCourse", {
//       course,
//       modules: modules.rows,
//       assignments: assignments.rows,
//       projects: projects.rows,
//     });
//   } catch (err) {
//     console.error("Error loading course:", err);
//     res.status(500).send("Server error");
//   }
// };

// exports.viewSingleCourse = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const courseResult = await pool.query(
//       "SELECT * FROM courses WHERE id = $1",
//       [id]
//     );
//     const course = courseResult.rows[0];

//     if (!course) {
//       return res.status(404).send("Course not found");
//     }

//     const modulesResult = await pool.query(
//       "SELECT * FROM modules WHERE course_id = $1",
//       [id]
//     );

//     const lessonsResult = await pool.query(
//       `
//       SELECT l.*, m.title AS module_title
//       FROM lessons l
//       JOIN modules m ON l.module_id = m.id
//       WHERE m.course_id = $1`,
//       [id]
//     );

//     const assignmentsResult = await pool.query(
//       "SELECT * FROM module_assignments WHERE course_id = $1",
//       [id]
//       );

//       const miniAssignmentsResult = await pool.query(
//         "SELECT * FROM lesson_assignments WHERE course_id = $1",
//         [id]
//       );

//     const projectsResult = await pool.query(
//       "SELECT * FROM course_projects WHERE course_id = $1",
//       [id]
//     );

//     const quizzesResult = await pool.query(
//       `
//       SELECT q.*, l.title AS lesson_title
//       FROM quizzes q
//       JOIN lessons l ON q.lesson_id = l.id
//       WHERE l.module_id IN (SELECT id FROM modules WHERE course_id = $1)
//     `,
//       [id]
//     );

//     res.render("admin/singleCourse", {
//       course,
//       modules: modulesResult.rows,
//       lessons: lessonsResult.rows,
//       assignments: assignmentsResult.rows,
//       miniassignments: miniAssignmentsResult.rows,
//       projects: projectsResult.rows,
//       quiz: quizzesResult.rows,
//       activeTab: req.query.tab || "details",
//     });
//   } catch (err) {
//     console.error("Error loading course:", err);
//     res.status(500).send("Server error");
//   }
// };

exports.viewSingleCourse = async (req, res) => {
  const { id } = req.params;

  try {
    // Get course details
    const courseResult = await pool.query(
      "SELECT * FROM courses WHERE id = $1",
      [id]
    );
    const course = courseResult.rows[0];

    if (!course) {
      return res.status(404).send("Course not found");
    }

    // Get modules for the course
    const modules = await pool.query(
      "SELECT * FROM modules WHERE course_id = $1",
      [id]
    );

    // Get lessons joined with module title
    const lessons = await pool.query(
      `
      SELECT l.*, m.title AS module_title
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      WHERE m.course_id = $1
    `,
      [id]
    );

    // Get module assignments
    const moduleAssignments = await pool.query(
      `
      SELECT ma.*, m.title AS module_title
      FROM module_assignments ma
      JOIN modules m ON ma.module_id = m.id
      WHERE m.course_id = $1
    `,
      [id]
    );

    // Get lesson assignments
    const lessonAssignments = await pool.query(
      `
      SELECT la.*, l.title AS lesson_title
      FROM lesson_assignments la
      JOIN lessons l ON la.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      WHERE m.course_id = $1
    `,
      [id]
    );

    // Get course projects
    const projects = await pool.query(
      "SELECT * FROM course_projects WHERE course_id = $1",
      [id]
    );

    // Get quizzes
    // const quizzes = await pool.query(
    //   `
    //   SELECT q.*, l.title AS lesson_title
    //   FROM quizzes q
    //   JOIN lessons l ON q.lesson_id = l.id
    //   JOIN modules m ON l.module_id = m.id
    //   WHERE m.course_id = $1
    // `,
    //   [id]
    // );

    const quizzes = await pool.query(
      `
  SELECT q.*, l.title AS lesson_title 
  FROM quizzes q 
  JOIN lessons l ON q.lesson_id = l.id 
  WHERE l.module_id IN (
    SELECT id FROM modules WHERE course_id = $1
  )
`,
      [id]
    );

    const infoResult = await pool.query(
      "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
    );
    const info = infoResult.rows[0];

    res.render("admin/singleCourse", {
      course,
      info,
      modules: modules.rows,
      lessons: lessons.rows,
      moduleAssignments: moduleAssignments.rows,
      lessonAssignments: lessonAssignments.rows,
      projects: projects.rows,
      quizzes: quizzes.rows,
      activeTab: req.query.tab || "details",
    });
  } catch (err) {
    console.error("Error loading course:", err);
    res.status(500).send("Server error");
  }
};
