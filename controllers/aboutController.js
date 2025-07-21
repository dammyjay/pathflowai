// const pool = require("../models/db");

// exports.getAboutPage = async (req, res) => {
//   const result = await pool.query("SELECT * FROM about_sections ORDER BY id");
//   const isLoggedIn = !!req.session.user; // or whatever property you use for login
//   const profilePic = req.session.user ? req.session.user.profile_picture : null;

//   let walletBalance = 0;
//   if (req.session.user) {
//     const walletResult = await pool.query(
//       "SELECT wallet_balance2 FROM users2 WHERE email = $1",
//       [req.session.user.email]
//     );
//     walletBalance = walletResult.rows[0]?.wallet_balance2 || 0;
//   }

//   const infoResult = await pool.query(
//     "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
//   );
//   const info = infoResult.rows[0] || {};
//   // ✅ Extract paid status from query
//   const paid = req.query.paid;
//   res.render("about", {
//     sections: result.rows,
//     info,
//     isLoggedIn,
//     users: req.session.user,
//     subscribed: req.query.subscribed,
//     paid,
//     walletBalance,
//   });
// };

// exports.getEditAboutPage = async (req, res) => {
//     const result = await pool.query("SELECT * FROM about_sections ORDER BY id");
//     const infoResult = await pool.query(
//       "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
//     );
//     const info = infoResult.rows[0] || {};
//   res.render("admin/editAbout", { sections: result.rows, info });
// };

// exports.updateAboutSection = async (req, res) => {
//   const { section_key, content } = req.body;
//   await pool.query(
//     "UPDATE about_sections SET content = $1, updated_at = NOW() WHERE section_key = $2",
//     [content, section_key]
//   );
//   res.redirect("/admin/about");
// };



const pool = require("../models/db");

// Show about page to users
exports.getAboutPage = async (req, res) => {
  const result = await pool.query("SELECT * FROM about_sections ORDER BY id");
  const infoResult = await pool.query(
    "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
  );

  res.render("about", {
    sections: result.rows,
    info: infoResult.rows[0] || {},
    isLoggedIn: !!req.session.user,
    users: req.session.user,
    subscribed: req.query.subscribed,
    paid: req.query.paid,
    walletBalance: 0,
  });
};

// Show admin edit view
exports.getEditAboutPage = async (req, res) => {
  const result = await pool.query("SELECT * FROM about_sections ORDER BY id");
  const infoResult = await pool.query(
    "SELECT * FROM company_info ORDER BY id DESC LIMIT 1"
  );
  res.render("admin/editAbout", {
    sections: result.rows,
    info: infoResult.rows[0] || {},
  });
};

// Create new section
exports.createAboutSection = async (req, res) => {
  const { section_key, section_title, content } = req.body;

  await pool.query(
    `INSERT INTO about_sections (section_key, section_title, content)
     VALUES ($1, $2, $3)`,
    [section_key, section_title, content]
  );

  res.redirect("/admin/about");
};

// Update section
exports.updateAboutSection = async (req, res) => {
  const { section_key, content } = req.body;
  await pool.query(
    "UPDATE about_sections SET content = $1, updated_at = NOW() WHERE section_key = $2",
    [content, section_key]
  );
  res.redirect("/admin/about");
};

// Delete section
exports.deleteAboutSection = async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM about_sections WHERE id = $1", [id]);
  res.redirect("/admin/about");
};
