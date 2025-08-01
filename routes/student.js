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


module.exports = router;
