const pool = require("../models/db");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
// controllers/learningController.js
const { askTutor } = require("../utils/ai");


exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, level, amount } = req.body;

  try {
    await pool.query(
      "UPDATE courses SET title = $1, description = $2, level = $3, amount = $4 WHERE id = $5",
      [title, description, level, amount, id]
    );
    res.redirect(`/admin/courses/${id}?tab=details`);
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).send("Server Error");
  }
};

// -------------------- MODULES --------------------
exports.createModule = async (req, res) => {
  const {
    title,
    course_id,
    description,
    objectives,
    learning_outcomes,
    order_number,
  } = req.body;
  let thumbnail = null;

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "modules",
    });
    thumbnail = result.secure_url;
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }

  try {
    await pool.query(
      "INSERT INTO modules (title, course_id, description, objectives, learning_outcomes, thumbnail, order_number) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        title,
        course_id,
        description,
        objectives,
        learning_outcomes,
        thumbnail,
        order_number,
      ]
    );
    res.redirect(`/admin/courses/${course_id}?tab=modules`);
  } catch (err) {
    console.error("Error creating module:", err);
    res.status(500).send("Server error");
  }
};

exports.editModule = async (req, res) => {
  const { title, description, objectives, learning_outcomes, order_number } =
    req.body;
  const { id } = req.params;

  let thumbnail = null;

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "modules",
    });
    thumbnail = result.secure_url;
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
  }

  const updatedThumbnail = thumbnail || null;
  await pool.query(
    "UPDATE modules SET title = $1, description = $2, objectives = $3, learning_outcomes = $4, thumbnail = $5, order_number = $6 WHERE id = $7",
    [
      title,
      description,
      objectives,
      learning_outcomes,
      updatedThumbnail,
      order_number,
      id,
    ]
  );

  // Find course ID to redirect correctly
  const result = await pool.query(
    "SELECT course_id FROM modules WHERE id = $1",
    [id]
  );
  const course_id = result.rows[0].course_id;
  res.redirect(`/admin/courses/${course_id}?tab=modules`);
};

exports.deleteModule = async (req, res) => {
  const { id } = req.params;

  // Find course ID first before delete
  const result = await pool.query(
    "SELECT course_id FROM modules WHERE id = $1",
    [id]
  );
  const course_id = result.rows[0].course_id;

  await pool.query("DELETE FROM modules WHERE id = $1", [id]);
  res.redirect(`/admin/courses/${course_id}?tab=modules`);
};


exports.getLessonsPage = async (req, res) => {
  try {
    const modulesRes = await pool.query(`
      SELECT m.*, c.title AS course_title
      FROM modules m
      JOIN courses c ON m.course_id = c.id
      ORDER BY c.title, m.title
    `);

    const selectedModuleId = req.query.module || null;
    let lessons = [];

    if (selectedModuleId) {
      const lessonsRes = await pool.query(
        `SELECT * FROM lessons WHERE module_id = $1 ORDER BY id DESC`,
        [selectedModuleId]
      );
      lessons = lessonsRes.rows;
    }

    res.render("admin/adminLessons", {
      modules: modulesRes.rows,
      lessons,
      selectedModuleId,
    });
  } catch (err) {
    console.error("Get Lessons Error:", err.message);
    res.status(500).send("Server Error");
  }
};

exports.createLesson = async (req, res) => {
  try {
    const { title, content, module_id, course_id, video_url } = req.body;

    await pool.query(
      `INSERT INTO lessons (title, content, module_id, video_url)
       VALUES ($1, $2, $3, $4)`,
      [title, content, module_id, video_url]
    );

    res.redirect(`/admin/courses/${course_id}?tab=lessons`);
  } catch (err) {
    console.error("Create Lesson Error:", err.message);
    res.status(500).send("Error creating lesson");
  }
};

// EDIT LESSON
exports.editLesson = async (req, res) => {
  const { id } = req.params;
  const { title, content, course_id, video_url } = req.body;

  try {
    await pool.query(
      `UPDATE lessons
       SET title=$1, content=$2, video_url=$3
       WHERE id=$4`,
      [title, content, video_url, id]
    );

    res.redirect(`/admin/courses/${course_id}?tab=lessons`);
  } catch (err) {
    console.error("Edit Lesson Error:", err.message);
    res.status(500).send("Error editing lesson");
  }
};


exports.deleteLesson = async (req, res) => {
  const { id } = req.params;
  const { course_id } = req.body;

  try {
    await pool.query("DELETE FROM lessons WHERE id = $1", [id]);
    res.redirect(`/admin/courses/${course_id}?tab=lessons`);
  } catch (err) {
    console.error("Error deleting lesson:", err.message);
    res.status(500).send("Server error");
  }
};


exports.getOrCreateLessonQuiz = async (req, res) => {
  const { lessonId } = req.params;

  try {
    // 1. Check if quiz exists
    let quizResult = await pool.query(
      `SELECT * FROM quizzes WHERE lesson_id = $1`,
      [lessonId]
    );

    let quiz;
    if (quizResult.rows.length === 0) {
      // Create quiz if not exists
      const insertQuiz = await pool.query(
        `INSERT INTO quizzes (lesson_id, title) VALUES ($1, $2) RETURNING *`,
        [lessonId, `Quiz for Lesson ${lessonId}`]
      );
      quiz = insertQuiz.rows[0];
    } else {
      quiz = quizResult.rows[0];
    }

    // 2. Get all questions for this quiz
    const questions = await pool.query(
      `SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY id ASC`,
      [quiz.id]
    );

    res.json({
      success: true,
      quiz,
      questions: questions.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.createQuizQuestion = async (req, res) => {
  try {
    const { quiz_id, question, question_type, correct_option } = req.body;
    let options = req.body.options || [];

    if (typeof options === "string") options = [options];

    await pool.query(
      `INSERT INTO quiz_questions (quiz_id, question, question_type, options, correct_option)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        quiz_id,
        question,
        question_type,
        options.length ? options : null,
        correct_option,
      ]
    );

    const updatedQuestions = await pool.query(
      `SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY id ASC`,
      [quiz_id]
    );

    res.json({ success: true, questions: updatedQuestions.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.deleteQuizQuestion = async (req, res) => {
  try {
    await pool.query(`DELETE FROM quiz_questions WHERE id = $1`, [
      req.params.id,
    ]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.editQuizQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, question_type, correct_option } = req.body;
    let options = req.body.options || [];

    if (typeof options === "string") options = [options];

    const updated = await pool.query(
      `UPDATE quiz_questions
       SET question = $1, question_type = $2, options = $3, correct_option = $4
       WHERE id = $5 RETURNING *`,
      [
        question,
        question_type,
        options.length ? options : null,
        correct_option,
        id,
      ]
    );

    const quiz_id = updated.rows[0].quiz_id;

    // return updated question list
    const updatedQuestions = await pool.query(
      `SELECT * FROM quiz_questions WHERE quiz_id = $1 ORDER BY id ASC`,
      [quiz_id]
    );

    res.json({ success: true, questions: updatedQuestions.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

exports.viewCourseWithAssignments = async (req, res) => {
  const courseId = req.params.id;
  const activeTab = req.query.tab || "assignment";
  const selectedModuleId = req.query.module || "all";

  try {
    // Get course info
    const courseRes = await pool.query("SELECT * FROM courses WHERE id = $1", [courseId]);
    const course = courseRes.rows[0];
    if (!course) return res.status(404).send("Course not found");

    // Get all modules for this course
    const modulesRes = await pool.query(
      "SELECT * FROM modules WHERE course_id = $1 ORDER BY title",
      [courseId]
    );
    const modules = modulesRes.rows;

    // Get assignments for this course (and module filter if selected)
    let assignmentsQuery = `
      SELECT a.*, m.title AS module_title
      FROM module_assignments a
      LEFT JOIN modules m ON a.module_id = m.id
      WHERE m.course_id = $1
    `;
    const queryParams = [courseId];

    if (selectedModuleId !== "all") {
      assignmentsQuery += " AND m.id = $2";
      queryParams.push(selectedModuleId);
    }

    assignmentsQuery += " ORDER BY a.id DESC";

    const assignmentsRes = await pool.query(assignmentsQuery, queryParams);
    const assignments = assignmentsRes.rows;

    res.render("admin/singleCourse", {
      course,
      modules,
      assignments,
      selectedModuleId,
      activeTab
    });
  } catch (err) {
    console.error("Error loading assignments:", err);
    res.status(500).send("Server error");
  }
};

function isAjax(req) {
  return (
    req.xhr ||
    req.headers['x-requested-with'] === 'XMLHttpRequest' ||
    (req.headers.accept && req.headers.accept.includes('application/json'))
  );
}

// CREATE
exports.createAssignment = async (req, res) => {
  const { title, instructions, lesson_id, module_id, course_id } = req.body;

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

    const result = await pool.query(
      `INSERT INTO module_assignments (title, instructions, ${field}) 
       VALUES ($1, $2, $3) RETURNING *`,
      [title, instructions, id]
    );

    // Attach module_title for frontend
    let moduleTitle = "";
    if (module_id) {
      const mod = await pool.query(`SELECT title FROM modules WHERE id = $1`, [
        module_id,
      ]);
      moduleTitle = mod.rows.length ? mod.rows[0].title : "";
    }
    result.rows[0].module_title = moduleTitle;

    if (isAjax(req)) {
      return res.json(result.rows[0]);
    } else {
      return res.redirect(`/admin/courses/${course_id}?tab=assignment`);
    }
  } catch (err) {
    console.error("Error creating assignment:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// EDIT
exports.editAssignment = async (req, res) => {
  const { id } = req.params;
  const { title, instructions, course_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE module_assignments 
       SET title = $1, instructions = $2 
       WHERE id = $3 
       RETURNING *`,
      [title, instructions, id]
    );

    if (isAjax(req)) {
      return res.json(result.rows[0]);
    } else {
      return res.redirect(`/admin/courses/${course_id}?tab=assignment`);
    }
  } catch (err) {
    console.error("Error editing assignment:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// DELETE
// exports.deleteAssignment = async (req, res) => {
//   const { id } = req.params;
//   const { course_id } = req.body;

//   try {
//     await pool.query("DELETE FROM module_assignments WHERE id = $1", [id]);

//     if (isAjax(req)) {
//       return res.json({ success: true });
//     } else {
//       return res.redirect(`/admin/courses/${course_id}?tab=assignment`);
//     }
//   } catch (err) {
//     console.error("Error deleting assignment:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };

exports.deleteAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM module_assignments WHERE id = $1", [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error("Error deleting assignment:", err);
    return res.status(500).json({ error: "Server error" });
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
  const selectedModuleId = req.query.module || "all"; // ✅ define it here

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

    // Lessons (filter if module selected)
    let lessonsQuery = `
      SELECT l.*, m.title AS module_title
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      WHERE m.course_id = $1
    `;
    let params = [id];
    if (selectedModuleId !== "all") {
      lessonsQuery += " AND m.id = $2";
      params.push(selectedModuleId);
    }
    const lessons = await pool.query(lessonsQuery, params);

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
      selectedModuleId, // ✅ pass to EJS so dropdown works
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



async function ensureQuizForLesson(lessonId) {
  // Find or create a row in `quizzes`
  const q = await pool.query(`SELECT id FROM quizzes WHERE lesson_id = $1 LIMIT 1`, [lessonId]);
  if (q.rows[0]) return q.rows[0].id;
  const created = await pool.query(
    `INSERT INTO quizzes (lesson_id, created_at) VALUES ($1, NOW()) RETURNING id`,
    [lessonId]
  );
  return created.rows[0].id;
}

// POST /admin/lessons/:lessonId/quiz/ai-generate
// exports.aiGenerateQuizForLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const { numQuestions = 5, difficulty = "mixed" } = req.body;

//     const lq = await pool.query(
//       `SELECT title, content FROM lessons WHERE id = $1 LIMIT 1`,
//       [lessonId]
//     );
//     if (!lq.rows[0]) return res.status(404).send("Lesson not found");

//     const prompt = `
// Generate ${numQuestions} quiz questions from this lesson.
// Return STRICT JSON with:
// [
//   {
//     "question": "...",
//     "question_type": "multiple_choice" | "short_answer",
//     "options": ["A","B","C","D"] // required if multiple_choice
//     "correct_option": "A" // exact matching string
//     "explanation": "why the answer is correct" // brief
//   },
//   ...
// ]

// Difficulty: ${difficulty}
// Lesson Title: ${lq.rows[0].title}
// Lesson Content:
// ${lq.rows[0].content || ""}
// `;

//     const raw = await askTutor({ question: prompt, lessonContext: "", userName: "Admin" });

//     // Parse JSON safely
//     let items = [];
//     try {
//       items = JSON.parse(raw);
//     } catch {
//       // Try to strip code fences or extra text
//       const m = raw.match(/\[[\s\S]*\]/);
//       items = m ? JSON.parse(m[0]) : [];
//     }

//     if (!Array.isArray(items) || items.length === 0) {
//       return res.status(400).send("AI did not return valid questions.");
//     }

//     const quizId = await ensureQuizForLesson(lessonId);

//     for (const it of items) {
//       const type = it.question_type === "short_answer" ? "short_answer" : "multiple_choice";
//       const options = type === "multiple_choice" ? it.options || [] : [];
//       await pool.query(
//         `INSERT INTO quiz_questions (quiz_id, question, question_type, options, correct_option, explanation)
//          VALUES ($1,$2,$3,$4,$5,$6)`,
//         [quizId, it.question, type, JSON.stringify(options), it.correct_option || "", it.explanation || null]
//       );
//     }

//     res.redirect(`/admin/lesson/${lessonId}/quiz?generated=1`);
//   } catch (e) {
//     console.error("AI quiz generate error:", e.message);
//     res.status(500).send("Failed to generate quiz.");
//   }
// };

exports.aiGenerateQuizForLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { numQuestions = 5, difficulty = "mixed" } = req.body;

    const lq = await pool.query(
      `SELECT title, content FROM lessons WHERE id = $1 LIMIT 1`,
      [lessonId]
    );
    if (!lq.rows[0]) return res.status(404).send("Lesson not found");

    const prompt = {
      question: `
Generate ${numQuestions} quiz questions in JSON.
Return ONLY JSON, no explanations outside JSON.
[
  {
    "question": "string",
    "question_type": "multiple_choice" | "short_answer",
    "options": ["A","B","C","D"],
    "correct_option": "string",
    "explanation": "string"
  }
]

Difficulty: ${difficulty}
Lesson Title: ${lq.rows[0].title}
Lesson Content: ${lq.rows[0].content || ""}
`,
    };

    const raw = await askTutor(prompt);
    let items = JSON.parse(raw); // ✅ guaranteed valid JSON

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).send("AI did not return valid questions.");
    }

    const quizId = await ensureQuizForLesson(lessonId);

    for (const it of items) {
      const type =
        it.question_type === "short_answer"
          ? "short_answer"
          : "multiple_choice";
      const options = type === "multiple_choice" ? it.options || [] : [];
      await pool.query(
        `INSERT INTO quiz_questions (quiz_id, question, question_type, options, correct_option, explanation)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          quizId,
          it.question,
          type,
          JSON.stringify(options),
          it.correct_option || "",
          it.explanation || null,
        ]
      );
    }

    res.redirect(`/admin/lesson/${lessonId}/quiz?generated=1`);
  } catch (e) {
    console.error("AI quiz generate error:", e.message, e.stack);
    res.status(500).send("Failed to generate quiz.");
  }
};

// Generate quiz but do NOT save, just return JSON
exports.aiPreviewQuizForLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { numQuestions = 5, difficulty = "mixed" } = req.body;

    const lq = await pool.query(
      `SELECT title, content FROM lessons WHERE id = $1 LIMIT 1`,
      [lessonId]
    );
    if (!lq.rows[0]) return res.status(404).json({ error: "Lesson not found" });

    const prompt = {
      question: `
Generate ${numQuestions} quiz questions in JSON.
Return ONLY JSON in this format:
[
  {
    "question": "string",
    "question_type": "multiple_choice" | "short_answer",
    "options": ["A","B","C","D"],
    "correct_option": "string",
    "explanation": "string"
  }
]

Difficulty: ${difficulty}
Lesson Title: ${lq.rows[0].title}
Lesson Content: ${lq.rows[0].content || ""}
`
    };

    const raw = await askTutor(prompt);
    let items = JSON.parse(raw);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "AI did not return valid questions." });
    }

    // ✅ Just send preview JSON
    res.json({ preview: items });
  } catch (e) {
    console.error("AI preview quiz error:", e.message);
    res.status(500).json({ error: "Failed to preview quiz." });
  }
};


exports.saveAIQuizForLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { questions } = req.body; // array from frontend

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: "Invalid quiz data" });
    }

    const quizId = await ensureQuizForLesson(lessonId);

    for (const it of questions) {
      const type =
        it.question_type === "short_answer"
          ? "short_answer"
          : "multiple_choice";
      const options = type === "multiple_choice" ? it.options || [] : [];
      await pool.query(
        `INSERT INTO quiz_questions (quiz_id, question, question_type, options, correct_option, explanation)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          quizId,
          it.question,
          type,
          JSON.stringify(options),
          it.correct_option || "",
          it.explanation || null,
        ]
      );
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("Save AI quiz error:", e.message);
    res.status(500).json({ error: "Failed to save quiz." });
  }
};




