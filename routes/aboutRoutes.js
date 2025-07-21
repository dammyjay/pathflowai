// const express = require("express");
// const router = express.Router();
// const aboutController = require("../controllers/aboutController");
// // const isAdmin = require("../middlewares/isAdmin");

// router.get("/about", aboutController.getAboutPage);
// router.get("/admin/about", aboutController.getEditAboutPage);
// router.post("/admin/about/update", aboutController.updateAboutSection);

// module.exports = router;



const express = require("express");
const router = express.Router();
const aboutController = require("../controllers/aboutController");

router.get("/about", aboutController.getAboutPage);
router.get("/admin/about", aboutController.getEditAboutPage);
router.post("/admin/about/create", aboutController.createAboutSection);
router.post("/admin/about/update", aboutController.updateAboutSection);
router.post("/admin/about/delete/:id", aboutController.deleteAboutSection);

module.exports = router;
