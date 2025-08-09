const express = require("express");
const router = express.Router();
// const parser = require("../middlewares/upload");

const adminController = require("../controllers/adminController");
const companyController = require("../controllers/companyController");
const articleController = require("../controllers/articleController");
const learningController = require("../controllers/learningController")
const { getCourseById } = require('../models/courseModel'); // adjust path if needed
const { getModulesByCourse } = require("../models/moduleModel"); // adjust path if needed
const {
  getQuizzesByLesson,
  createQuiz,
  deleteQuiz,
  getLessonAssignments,
  createLessonAssignment,
  deleteLessonAssignment,
  getModuleAssignments,
  createModuleAssignment,
  deleteModuleAssignment,
  getCourseProjects,
  createCourseProject,
  deleteCourseProject,
} = require("../controllers/learningController");


// const galleryController = require("../controllers/galleryController");
// const devotionalController = require("../controllers/devotionalController");

// const demoVideoController = require("../controllers/demoVideoController");

const multer = require("multer");
// const upload = multer({ dest: 'uploads/' }); // temp local storage
const upload = require("../middlewares/upload");

router.get("/login", adminController.showLogin);
router.post("/login", adminController.login);
router.get("/dashboard", adminController.dashboard);
router.get("/logout", adminController.logout);

router.get("/users/edit/:id", adminController.editUserForm);
router.post("/users/delete/:id", adminController.deleteUser);
router.post("/users/edit/:id", adminController.updateUser);

// company Info routes
router.get("/company", companyController.showForm);

// POST form with multiple file uploads mini
router.post(
  "/company",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "heroImage", maxCount: 1 },
  ]),
  companyController.saveInfo
);

// const galleryController = require('../controllers/galleryController');

// router.get("/gallery", galleryController.showGalleryUpload); // show the form
// router.post(
//   "/gallery/upload",
//   upload.single("image"),
//   galleryController.uploadImage
// ); // handle upload

// // Show edit form
// router.get("/gallery/edit/:id", galleryController.showEditImage);
// // Handle edit form submission
// router.post(
//   "/gallery/edit/:id",
//   upload.single("image"),
//   galleryController.editImage
// );
// // Handle delete
// router.post("/gallery/delete/:id", galleryController.deleteImage);

// // Show category management page
// router.get("/gallery/categories", galleryController.showCategories);

// // Handle new category creation
// router.post("/gallery/categories", galleryController.createCategory);

// // (Optional) Handle category deletion
// router.post("/gallery/categories/delete/:id", galleryController.deleteCategory);

// // Handle category edit form submission
// router.post("/gallery/categories/edit/:id", galleryController.editCategory);

router.get('/articles', articleController.showArticles);
router.get("/articles", articleController.showSearchArticles);
router.post("/articles", upload.single("image"), articleController.saveArticle);
// router.get('/articles/:id', articleController.showSingleArticle);

router.get("/articles/edit/:id", articleController.showEditForm);
router.post(
  "/articles/edit/:id",
  upload.single("image"),
  articleController.updateArticle
);
router.post("/articles/delete/:id", articleController.deleteArticle);

// Career Pathways
router.get("/pathways", adminController.showPathways);
// router.post("/admin/pathways", adminController.createPathway);
router.post(
  "/pathways",
  upload.single("thumbnail"),
  adminController.createPathway
);
router.post(
  "/pathways/edit/:id",
  upload.single("thumbnail"),
  adminController.editPathway
);

router.post("/pathways/delete/:id", adminController.deletePathway);

// Courses
router.get("/courses", adminController.showCourses);
router.post("/courses", upload.single("thumbnail"), adminController.createCourse);
router.post(
  "/courses/edit/:id",
  upload.single("thumbnail"),
  adminController.editCourse
);
router.post("/courses/delete/:id", adminController.deleteCourse);

router.get("/pathways/:id/courses", adminController.showCoursesByPathway);
router.post(
  "/pathways/:id/courses",
  upload.single("thumbnail"),
  adminController.createCourseUnderPathway
);

// router.get("/courses/:courseId", async (req, res) => {
//   const courseId = req.params.courseId;
//   const tab = req.query.tab || "details";

//   const course = await getCourseById(courseId);
//   const modules = await getModulesByCourse(courseId);
//   const lessons = await getLessonsByModules(modules.map((m) => m.id));
//   const assignment = await getCourseAssignment(courseId);
//   const project = await getCourseProject(courseId);

//   res.render("admin/singleCourse", {
//     course,
//     modules,
//     lessons,
//     assignment,
//     project,
//     activeTab: tab,
//   });
// });


//benefits
// router.get("/admin/courses/:id", async (req, res) => {
//   const courseId = req.params.id;
//   const course = await getCourseById(courseId);
//   const modules = await getModulesByCourse(courseId);
//   const lessons = await getLessonsByCourse(courseId);
//   const assignment = null;
//   const project = null;

//   res.render("admin/singleCourse", {
//     course,
//     modules,
//     lessons,
//     assignment,
//     project,
//     activeTab: req.query.tab || "details",
//   });
// });

// router.get("/admin/courses/:id", learningController.getSingleCourse);

// router.get("/courses/:id", learningController.viewSingleCourse);
router.get("/courses/:id", learningController.viewSingleCourse);
router.post("/admin/courses/:id/edit", learningController.updateCourse);
// router.post("/admin/courses/:id/delete", learningController.deleteCourse);

// Modules
// router.post("/admin/courses/:id/modules", learningController.createModule);
// router.post("/admin/modules/:id/edit", learningController.editModule);
// router.post("/admin/modules/:id/delete", learningController.deleteModule);

router.post("/modules/create", upload.single("thumbnail"), learningController.createModule);
router.post(
  "/modules/edit/:id",
  upload.single("thumbnail"),
  learningController.editModule
);
router.post("/modules/delete/:id", learningController.deleteModule);

// Lessons
// router.get("/lessons", adminController.getLessons);
// router.post("/admin/modules/:id/lessons", upload.single(video_url), learningController.createLesson);
// router.post("/admin/lessons/:id/edit", learningController.editLesson);
// router.post("/admin/lessons/:id/delete", learningController.deleteLesson);

router.post(
  "/lessons/create",
  upload.single("video_url"),
  learningController.createLesson
);
router.post(
  "/lessons/:id/edit",
  upload.single("video_url"),
  learningController.editLesson
);
router.post("/lessons/:id/delete", learningController.deleteLesson);

// Quiz
// router.post("/admin/lessons/:id/quiz", learningController.createQuiz);
// router.post("/admin/quizzes/:id/questions", learningController.addQuizQuestion);
// router.post("/admin/quizzes/:id/delete", learningController.deleteQuiz);


// Get or create quiz for lesson
router.get('/lesson/:lessonId/quiz', learningController.getOrCreateLessonQuiz);

// Create question
// router.post('/quiz-question/create', learningController.createQuizQuestion);
router.post(
  "/quiz-question/create",
  upload.none(),
  learningController.createQuizQuestion
);

router.post(
  "/quiz-question/:id/edit",
  upload.none(), // multer middleware to parse form-data
  learningController.editQuizQuestion
);

// Delete question
router.post('/quiz-question/:id/delete', learningController.deleteQuizQuestion);


// Handle lesson assignment
// router.post("/admin/lessons/:id/assignment", learningController.createAssignment);

// Handle module assignment using same function
// View single course with assignments tab support
router.get("/courses/:id", learningController.viewCourseWithAssignments);


router.post(
  "/assignments/create",
  upload.none(),
  learningController.createAssignment
);
router.post(
  "/assignments/:id/edit",
  upload.none(),
  learningController.editAssignment
);

// Delete
router.post('/assignments/:id/delete', learningController.deleteAssignment);


// Projects
router.post(
  "/admin/courses/:id/project",
  learningController.createProject
);



router.get("/benefits", adminController.showBenefits);
router.post("/benefits", upload.single("icon"), adminController.createBenefit);
router.get("/benefits/edit/:id", adminController.editBenefitForm);
router.post(
  "/benefits/edit/:id",
  upload.single("icon"),
  adminController.updateBenefit
);
router.post("/benefits/delete/:id", adminController.deleteBenefit);


// router.get("/admin/events", adminController.listEvents);
router.post("/events", upload.single("image"), adminController.createEvent);
router.get(
  "/events/registrations/:id",
  adminController.viewEventRegistrations
);
router.get("/events", adminController.showEvents); // list all events
router.get(
  "/events/registrations/:id/export",
  adminController.exportEventRegistrations
);

// Edit event (update)
router.put("/events/:id", upload.single("image"), adminController.updateEvent);

// Delete event
router.delete("/events/:id", adminController.deleteEvent);




// // Temporary route to add `created_at` column
// router.get("/fix-created-at", async (req, res) => {
//   try {
//     await pool.query(`
//         ALTER TABLE articles
//         ADD COLUMN IF NOT EXISTS created_at4 TIMESTAMPTZ DEFAULT NOW();
//       `);
//     res.send("✅ created_at column added successfully!");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("❌ Failed to add column.");
//   }
// });

// router.get("/forgot-password", adminController.showForgotPasswordForm);
// router.post("/forgot-password", adminController.handleForgotPassword);
// router.get("/reset-password/:token", adminController.showResetPasswordForm);
// router.post("/reset-password/:token", adminController.handleResetPassword);

// // routes for announcements
// router.get("/announcements", adminController.showAnnouncements);
// router.post(
//   "/announcements",
//   upload.single("flyer"),
//   adminController.createAnnouncement
// );

// router.post("/announcements/delete/:id", adminController.deleteAnnouncement);
// router.get("/announcements/edit/:id", adminController.showEditAnnouncement);
// router.post(
//   "/announcements/edit/:id",
//   upload.single("flyer"),
//   adminController.editAnnouncement
// );

// // send newsletter email
// router.get("/newsletter", adminController.showNewsletterForm);

// router.post("/newsletter/send-now/:id", adminController.sendNow);
// router.post(
//   "/newsletter/edit/:id",
//   upload.single("image"),
//   adminController.editNewsletter
// );

// router.post(
//   "/newsletter",
//   upload.single("image"),
//   adminController.handleNewsletterForm
// );
// router.post("/newsletter/delete/:id", adminController.deleteNewsletter);

// router.get("/admin/profile", adminController.getAdminProfile);
// router.post(
//   "/admin/profile",
//   upload.single("profile_picture"),
//   adminController.updateAdminProfile
// );

// router.get("/devotionals", devotionalController.showUploadForm);
// router.post(
//   "/devotionals",
//   upload.single("image_url"),
//   devotionalController.saveDevotional
// );
// router.get("/devotionals/edit/:id", devotionalController.showEditDevotional);
// router.post(
//   "/devotionals/edit/:id",
//   upload.single("image_url"),
//   devotionalController.updateDevotional
// );
// router.post("/devotionals/delete/:id", devotionalController.deleteDevotional);

// router.get("/demo-videos", demoVideoController.showDemoVideos);
// router.post(
//   "/demo-videos",
//   upload.single("video"),
//   demoVideoController.saveDemoVideo
// );
// router.post("/demo-videos/delete/:id", demoVideoController.delete);
// router.post(
//   "/demo-videos/edit/:id",
//   upload.single("video"),
//   demoVideoController.update
// );

module.exports = router;
