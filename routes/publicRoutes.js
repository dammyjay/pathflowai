const express = require("express");
const router = express.Router();
const pool = require("../models/db");
// const upload = require("../middleware/upload");
const axios = require("axios");
const userController = require("../controllers/userController");
const sendEmail = require("../utils/sendEmail");
// const articleController = require("../controllers/articleController");

// Homepage Route

// router.get("/", async (req, res) => {
//   try {
//     const [infoResult, career_pathwaysResult, videosResult] = await Promise.all([
//       pool.query("SELECT * FROM company_info ORDER BY id DESC LIMIT 1"),
//       pool.query("SELECT * FROM career_pathways ORDER BY created_at3 DESC LIMIT 3"),
//       pool.query("SELECT * FROM videos4 ORDER BY created_at3 DESC LIMIT 3"),
//     ]);
//     const faqsResult = await pool.query(
//       "SELECT * FROM faqs WHERE is_published = true ORDER BY created_at DESC LIMIT 5"
//     );
//     // const randomImagesResult = await pool.query(
//     //   "SELECT url FROM gallery_images ORDER BY RANDOM() LIMIT 5"
//     // );
//     const info = infoResult.rows[0];
//     const career_pathways = career_pathwaysResult.rows;
//     const faqs = faqsResult.rows;
//     const annResult = await pool.query(
//       // "SELECT * FROM announcements ORDER BY event_date DESC LIMIT 1"
//       "SELECT * FROM announcements WHERE is_visible = true ORDER BY event_date DESC LIMIT 1"
//     );
//     const announcement = annResult.rows[0];
//     // const carouselImages = randomImagesResult.rows.map((row) => row.url);

//     // fetch demo videos
//     // const demoVideos = await demoVideoController.getPublicDemoVideos();
//     const demoResult = await pool.query(
//       "SELECT * FROM demo_videos2 ORDER BY created_at DESC"
//     );
//     const demoVideos = demoResult.rows;
//     console.log("Demo Videos:", demoVideos);

//     //fetch daily devotionals
//     // const devoRes = await pool.query(
//     //   "SELECT * FROM devotionals ORDER BY created_at DESC LIMIT 1"
//     // );

//     const devoRes = await pool.query(
//       "SELECT * FROM devotionals WHERE visible = true ORDER BY created_at DESC LIMIT 1"
//     );
//     const devotional = devoRes.rows[0];

//     const allImagesResult = await pool.query("SELECT url FROM gallery_images");
//     const allImages = allImagesResult.rows.map((row) => row.url);

//     // Deterministically shuffle based on the day
//     function getDailyImages(images, count) {
//       const today = new Date();
//       let seed =
//         today.getFullYear() * 10000 +
//         (today.getMonth() + 1) * 100 +
//         today.getDate();
//       // Simple seeded shuffle (Fisher-Yates with seed)
//       let arr = images.slice();
//       let random = function () {
//         var x = Math.sin(seed++) * 10000;
//         return x - Math.floor(x);
//       };
//       for (let i = arr.length - 1; i > 0; i--) {
//         const j = Math.floor(random() * (i + 1));
//         [arr[i], arr[j]] = [arr[j], arr[i]];
//       }
//       return arr.slice(0, count);
//     }

//     const carouselImages = getDailyImages(allImages, 5);

//     console.log(
//       "Raw video URLs:",
//       videosResult.rows.map((v) => v.youtube_url)
//     );
//     const videos = videosResult.rows.map((video) => {
//       let embedUrl = video.youtube_url;

//       if (!embedUrl.includes("youtube.com/embed/")) {
//         // Full YouTube URL
//         const match = embedUrl.match(
//           /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/
//         );
//         if (match) {
//           embedUrl = `https://www.youtube.com/embed/${match[1]}`;
//         } else {
//           // Shortened youtu.be URL
//           // const shortMatch = embedUrl.match(/(?:https?:\/\/)?youtu\.be\/([^&]+)/);
//           const shortMatch = embedUrl.match(
//             /(?:https?:\/\/)?youtu\.be\/([\w-]{11})/
//           );
//           if (shortMatch) {
//             embedUrl = `https://www.youtube.com/embed/${shortMatch[1]}`;
//           } else {
//             // If just a video ID without domain
//             if (/^[\w-]{11}$/.test(embedUrl)) {
//               embedUrl = `https://www.youtube.com/embed/${embedUrl}`;
//             } else {
//               // fallback to empty or invalid URL if no match
//               embedUrl = "";
//             }
//           }
//         }
//       }

//       return {
//         ...video,
//         embed_url: embedUrl,
//       };
//     });
//     console.log(
//       videos.map((v) => ({ title: v.title, embed_url: v.embed_url }))
//     );

//     // Add this line to pass login status to EJS
//     const isLoggedIn = !!req.session.user; // or whatever property you use for login
//     const profilePic = req.session.user ? req.session.user.profile_pic : null;
//     console.log("User session:", req.session.user);
//     console.log("Is user logged in:", isLoggedIn);
//     res.render("home", {
//       info,
//       title: "Company Home",
//       career_pathways,
//       videos,
//       faqs,
//       demoVideos,
//       devotional,
//       subscribed: req.query.subscribed,
//       isLoggedIn: !!req.session.user,
//       profilePic,
//       carouselImages,
//       announcement,
//     });
//   } catch (err) {
//     console.error("Error fetching homepage data:", err);
//     res.status(500).send("Server Error");
//   }
// });

router.get("/events/:id", userController.showEvent);
router.get("/", async (req, res) => {
    try {
      const [infoResult, career_pathwaysResult, usersResult] = await Promise.all([
        pool.query("SELECT * FROM company_info ORDER BY id DESC LIMIT 1"),
        pool.query("SELECT * FROM career_pathways WHERE show_on_homepage = true ORDER BY created_at"),
        pool.query("SELECT * FROM users2"),
      ]);
        
      // const faqsResult = await pool.query(
      //   "SELECT * FROM faqs WHERE is_published = true ORDER BY created_at DESC LIMIT 5"
      // );
  
      // const randomImagesResult = await pool.query(
      //   "SELECT url FROM gallery_images ORDER BY RANDOM() LIMIT 5"
      // );
      const info = infoResult.rows[0];
      const users = usersResult.rows;
      const career_pathways = career_pathwaysResult.rows;
      // const faqs = faqsResult.rows;
      // const annResult = await pool.query(
      //   // "SELECT * FROM announcements ORDER BY event_date DESC LIMIT 1"
      //   "SELECT * FROM announcements WHERE is_visible = true ORDER BY event_date DESC LIMIT 1"
      // );
      // const announcement = annResult.rows[0];
      // const carouselImages = randomImagesResult.rows.map((row) => row.url);
  
      // fetch demo videos
      // const demoVideos = await demoVideoController.getPublicDemoVideos();
  
      // const demoResult = await pool.query(
      //   "SELECT * FROM demo_videos2 ORDER BY created_at DESC"
      // );
      // const demoVideos = demoResult.rows;
      // console.log("Demo Videos:", demoVideos);
  
  
  
      // const allImagesResult = await pool.query("SELECT url FROM gallery_images");
      // const allImages = allImagesResult.rows.map((row) => row.url);
  
      // Deterministically shuffle based on the day
      // function getDailyImages(images, count) {
      //   const today = new Date();
      //   let seed =
      //     today.getFullYear() * 10000 +
      //     (today.getMonth() + 1) * 100 +
      //     today.getDate();
      //   // Simple seeded shuffle (Fisher-Yates with seed)
      //   let arr = images.slice();
      //   let random = function () {
      //     var x = Math.sin(seed++) * 10000;
      //     return x - Math.floor(x);
      //   };
      //   for (let i = arr.length - 1; i > 0; i--) {
      //     const j = Math.floor(random() * (i + 1));
      //     [arr[i], arr[j]] = [arr[j], arr[i]];
      //   }
      //   return arr.slice(0, count);
      // }
  
      // wallet balance code
     
      const benefitsRes = await pool.query(
        "SELECT * FROM benefits ORDER BY created_at ASC"
      );

      const coursesResult = await pool.query(
        `
          SELECT courses.*, cp.title AS pathway_name
          FROM courses
          LEFT JOIN career_pathways cp ON cp.id = courses.career_pathway_id
          ORDER BY cp.title ASC, courses.level ASC, sort_order ASC LIMIT 10
        `
      );
      
      // const eventsResult = await pool.query(
      //   `SELECT * FROM events ORDER BY event_date DESC LIMIT 5`
      // );

      const eventsResult = await pool.query(
        "SELECT * FROM events WHERE show_on_homepage = true ORDER BY event_date ASC LIMIT 5"
      );

      const events = eventsResult.rows;

      let walletBalance = 0;
      if (req.session.user) {
        const walletResult = await pool.query(
          "SELECT wallet_balance2 FROM users2 WHERE email = $1",
          [req.session.user.email]
        );
        walletBalance = walletResult.rows[0]?.wallet_balance2 || 0;
      }

  
      // Add this line to pass login status to EJS
      const isLoggedIn = !!req.session.user; // or whatever property you use for login
      const profilePic = req.session.user ? req.session.user.profile_picture : null;
      console.log("User session:", req.session.user);
      console.log("Is user logged in:", isLoggedIn);
      res.render("home", {
        info,
        users,
        events,
        walletBalance,
        career_pathways,
        title: "Company Home",
        profilePic,
        benefits: benefitsRes.rows,
        courses: coursesResult.rows,
        isLoggedIn: !!req.session.user,
        subscribed: req.query.subscribed,
      });
    } catch (err) {
      console.error("Error fetching homepage data:", err);
      res.status(500).send("Server Error");
    }
});
  
// router.get("/make-payment", (req, res) => {
//   if (!req.session.user) {
//     return res.redirect("/admin/login");
//   }

//   const fullname = req.session.user.fullname;
//   const email = req.session.user.email;
//   res.render("payment", {
//     title: "Make Payment",
//     fullname,
//     email,
//     profilePic: req.session.user.profile_pic || null,
//   });
// });

// PAYSTACK PAYMENT VERIFICATION

router.get("/make-payment", async (req, res) => {
  if (!req.session.user || !req.session.user.email) {
    return res.redirect("/admin/login"); // Redirect if not logged in
  }

  try {
    const userEmail = req.session.user.email;

    // Fetch user details from database
    const result = await pool.query(
      "SELECT fullname, email, profile_picture FROM users2 WHERE email = $1",
      [userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    const user = result.rows[0];

    res.render("payment", {
      title: "Make Payment",
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profile_picture || null,
    });
  } catch (err) {
    console.error("Error fetching user for payment:", err);
    res.status(500).send("Server error");
  }
});


router.post("/verify-payment", async (req, res) => {
  const { reference, email, fullName } = req.body;

  try {
    console.log(
      "🔍 Verifying payment with ref:",
      reference,
      "Email:",
      email,
      "Full Name:",
      fullName
    );

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Make sure this is set in your .env file
        },
      }
    );
    console.log("✅ Paystack Response:", response.data);

    const payment = response.data.data;

    if (payment.status === "success") {
      const amount = payment.amount / 100;

      // Save transaction to DB
      await pool.query(
        `INSERT INTO transactions (fullname, email, amount, reference, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [fullName, email, amount, reference, "success"]
      );

      // ✅ Update user's wallet balance
      await pool.query(
        `UPDATE users2 SET wallet_balance2 = wallet_balance2 + $1 WHERE email = $2`,
        [amount, email]
      );

      return res.json({
        success: true,
        message: "Payment verified successfully and wallet updated",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error(
      "❌ Error verifying payment:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        "Server error during payment verification",
    });
  }
});

router.get("/courses", async (req, res) => {
  const infoResult = await pool.query(
    "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
  );
  const info = infoResult.rows[0] || {};

  const usersResult = await pool.query ("SELECT * FROM users2");
    const users = usersResult.rows;
  const careerPathwaysResult = await pool.query(
    "SELECT * FROM career_pathways ORDER BY title"
  );
  const coursesResult = await pool.query(`
    SELECT courses.*, cp.title AS pathway_name
    FROM courses
    LEFT JOIN career_pathways cp ON cp.id = courses.career_pathway_id
    ORDER BY cp.title ASC, courses.level ASC, sort_order ASC
  `);

  // Grouping courses by pathway and level
  const groupedCourses = {};

  coursesResult.rows.forEach((course) => {
    const pathway = course.pathway_name || "Unassigned";
    const level = course.level || "Unspecified";

    if (!groupedCourses[pathway]) groupedCourses[pathway] = {};
    if (!groupedCourses[pathway][level]) groupedCourses[pathway][level] = [];

    groupedCourses[pathway][level].push(course);
  });

   const isLoggedIn = !!req.session.user; // or whatever property you use for login
   const profilePic = req.session.user
     ? req.session.user.profile_picture
     : null;
   console.log("User session:", req.session.user);
   console.log("Is user logged in:", isLoggedIn);

  res.render("userCourses", {
    info,
    users,
    isLoggedIn: !!req.session.user,
    profilePic,
    groupedCourses,
    careerPathways: careerPathwaysResult.rows,
    subscribed: req.query.subscribed,
  });
});

router.get("/pay-event/:regId", async (req, res) => {
  const { regId } = req.params;

  try {
    const regResult = await pool.query(
      `SELECT r.*, e.title, e.amount, e.image_url
       FROM event_registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.id = $1`,
      [regId]
    );

    if (regResult.rows.length === 0) {
      return res.status(404).send("Registration not found");
    }

    const reg = regResult.rows[0];

    res.render("eventPayment", {
      reg,
      title: "Event Payment",
    });
  } catch (err) {
    console.error("Error loading payment page:", err);
    res.status(500).send("Server error");
  }
});

router.post("/verify-event-payment", async (req, res) => {
  const { reference, regId } = req.body;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const payment = response.data.data;

    if (payment.status === "success") {
      const amount = payment.amount / 100;

      // ✅ Update registration as paid
      await pool.query(
        `UPDATE event_registrations
         SET payment_status = 'completed', amount_paid = $1
         WHERE id = $2`,
        [amount, regId]
      );

      // ✅ Fetch registration + event details
      // const regResult = await pool.query(
      //   `SELECT r.*, e.title, e.event_date, e.time, e.location
      //    FROM event_registrations r
      //    JOIN events e ON r.event_id = e.id
      //    WHERE r.id = $1`,
      //   [regId]
      // );

      // const reg = regResult.rows[0];
      // if (!reg || !reg.registrant_email) {
      //   console.error("❌ No registrant email found for ID:", regId);
      //   return res.status(400).json({
      //     success: false,
      //     message: "Email not found for registrant",
      //   });
      // }

      // console.log("📧 Sending to:", reg.registrant_email);
      // // ✅ Send confirmation email
      // await sendEmail({
      //   to: reg.registrant_email,
      //   subject: `✅ Event Registration Successful: ${reg.title}`,
      //   html: `
      //     <h2>🎉 Thank You for Registering!</h2>
      //     <p>Hello ${reg.registrant_name},</p>
      //     <p>Your payment of <strong>₦${amount}</strong> for the event "<strong>${
      //     reg.title
      //   }</strong>" has been confirmed.</p>
      //     <p><strong>Date:</strong> ${new Date(
      //       reg.event_date
      //     ).toDateString()}<br />
      //     <strong>Time:</strong> ${reg.time}<br />
      //     <strong>Location:</strong> ${reg.location}</p>
      //     <p>We're excited to have you join us!</p>
      //     <p>— JKT EdTech Team</p>
      //   `,
      // });

      return res.json({ success: true, message: "Payment Sucessful" });
    } else {
      return res.json({ success: false, message: "Payment failed" });
    }
  } catch (err) {
    console.error("❌ Error verifying event payment:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/pathways/:id", async (req, res) => {
   const { id } = req.params;

   try {
     // Get company info
     const infoResult = await pool.query(
       "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
     );
     const info = infoResult.rows[0] || {};

     // Get the pathway details
     const pathwayResult = await pool.query(
       "SELECT * FROM career_pathways WHERE id = $1",
       [id]
     );
     const pathway = pathwayResult.rows[0];

     if (!pathway) return res.status(404).send("Pathway not found");

     // Get courses under this pathway, grouped by level
     const courseResult = await pool.query(
       `SELECT * FROM courses 
       WHERE career_pathway_id = $1
       ORDER BY level ASC, sort_order ASC`,
       [id]
     );

     const courses = courseResult.rows;

     const groupedCourses = {};
     courses.forEach((course) => {
       const level = course.level || "Unspecified";
       if (!groupedCourses[level]) groupedCourses[level] = [];
       groupedCourses[level].push(course);
     });

     const usersResult = await pool.query("SELECT * FROM users2");
     const users = usersResult.rows;
     const isLoggedIn = !!req.session.user; // or whatever property you use for login
     const profilePic = req.session.user
       ? req.session.user.profile_picture
       : null;
     console.log("User session:", req.session.user);
     console.log("Is user logged in:", isLoggedIn);

     res.render("singlePathway", {
       info,
       users,
       isLoggedIn: !!req.session.user,
       profilePic,
       pathway,
       groupedCourses,
       subscribed: req.query.subscribed,
     });
   } catch (err) {
     console.error("❌ Error fetching pathway details:", err.message);
     res.status(500).send("Server error");
   }
});



  module.exports = router;
