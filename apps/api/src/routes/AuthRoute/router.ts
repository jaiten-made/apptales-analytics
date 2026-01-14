import express from "express";

const router: express.Router = express.Router();

// @route   GET /auth/signout
// @desc    Sign out user
// @access  Public
router.post("/signout", async (_req, res, _next) => {
  res.clearCookie("session");
  res.redirect(`${process.env.APP_BASE_URL!}/auth/signin`);
});

export default router;
