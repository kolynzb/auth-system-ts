import express, { Router } from "express";
import passport from "passport";
import authController from "../controllers/auth.controller";

const router: Router = express.Router();
router.post("/register", authController.register);
router.post("/activate", authController.handleActivation);
router.get("/resendCode", authController.resendActiveCode);

router.post("/login", passport.authenticate("local"), authController.login);

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } else {
    res.status(400).json({ error: "Something went wrong" });
  }
});

// Gooogle Login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    successRedirect: process.env.FRONTEND_URL,
    failureRedirect: "/login/failed/",
  }),
  (req, res) => {
    res.status(200).json({ success: "User logged in" });
  }
);

router.get("/login/failed", (req, res) => {
  res.send(400).json("Something went wrong");
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.status(200).json({ success: "Logout success" });
});

export default router;
