const express = require("express");
const router = express.Router();
const pool = require("../models/db");
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

router.get("/", async (req, res) => {
    try {
      const [infoResult, career_pathwaysResult, videosResult] = await Promise.all([
        pool.query("SELECT * FROM company_info ORDER BY id DESC LIMIT 1"),
        pool.query("SELECT * FROM career_pathways ORDER BY created_at"),
        // pool.query("SELECT * FROM videos4 ORDER BY created_at3 DESC LIMIT 3"),
      ]);
  
      // const faqsResult = await pool.query(
      //   "SELECT * FROM faqs WHERE is_published = true ORDER BY created_at DESC LIMIT 5"
      // );
  
      // const randomImagesResult = await pool.query(
      //   "SELECT url FROM gallery_images ORDER BY RANDOM() LIMIT 5"
      // );
      const info = infoResult.rows[0];
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
  
      
  
      // Add this line to pass login status to EJS
      const isLoggedIn = !!req.session.user; // or whatever property you use for login
      const profilePic = req.session.user ? req.session.user.profile_pic : null;
      console.log("User session:", req.session.user);
      console.log("Is user logged in:", isLoggedIn);
      res.render("home", {
        info,
        career_pathways,
        title: "Company Home",
        profilePic,
        isLoggedIn: !!req.session.user,
        subscribed: req.query.subscribed,
        
      });
    } catch (err) {
      console.error("Error fetching homepage data:", err);
      res.status(500).send("Server Error");
    }
  });
  module.exports = router;