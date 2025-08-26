const express = require("express");
const router = express.Router();
const multer = require("multer");
// const upload = multer({ dest: 'uploads/' }); // temp local storage
const upload = require("../middlewares/upload");

const studentController = require("../controllers/studentController");

const { ensureAuthenticated } = require("../middlewares/auth");
router.get("/dashboard", studentController.getDashboard);
router.get("/courses", studentController.getEnrolledCourses);
router.get("/analytics", studentController.getAnalytics);
router.post("/update-xp", studentController.updateXP);
router.post("/award-badge", studentController.awardBadge);
// Mark lesson complete
router.post("/lessons/:lessonId/complete", studentController.completeLesson);
// router.post("/courses/enroll/:courseId", studentController.enrollInCourse); 

router.post(
  "/courses/enroll/:courseId",
  ensureAuthenticated,
  studentController.enrollInCourse
);

router.post(
  "/profile/edit",
  upload.single("profilePic"),
  studentController.editProfile
);

router.get(
  "/lessons/:lessonId",
  ensureAuthenticated,
  studentController.viewLesson
);

router.get(
  "/modules/:moduleId",
  ensureAuthenticated,
  studentController.getModuleDetails
);

// Get quiz questions for a lesson
router.get('/lessons/:id/quiz', studentController.getLessonQuiz);

// Submit quiz answers
// router.post('/lessons/:id/quiz/submit', studentController.submitLessonQuiz);

// router.post(
//   "/lessons/:id/quiz/submit",
//   express.json(), // This parses JSON bodies
//   studentController.submitLessonQuiz
// );

// router.post(
//   "/lessons/:id/quiz/submit",
//   express.json(),
//   studentController.submitLessonQuiz
// );

// router.post("/lessons/:id/quiz/submit", studentController.submitLessonQuiz);

router.post(
  "/lessons/:id/quiz/submit",
  express.json(),
  studentController.submitLessonQuiz
);




// routes/student.js
router.get('/lessons/:id', studentController.getLesson);


router.post("/ai/ask", ensureAuthenticated, studentController.askAITutor);



module.exports = router;
