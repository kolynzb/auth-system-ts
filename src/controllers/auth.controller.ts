import User from "../models/user.model";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });
  const foundUser = await User.findOne({ email: email }).exec();
  if (foundUser)
    return res
      .status(409)
      .json({ error: "User already exists with this email" });

  try {
    const hashedPwd = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: hashedPwd,
      userStatus: {
        status: "Pending",
      },
    });
    console.log(newUser);
    sendConfirmationCode(email, res);

    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const resendActiveCode = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.pending_user_email) return res.sendStatus(409);
  const userEmail = cookies.pending_user_email;
  let email;
  jwt.verify(userEmail, process.env.CONFIRM_CODE_TOKEN, (err, decoded) => {
    if (err) return res.sendStatus(403);
    email = decoded.email;
  });
  const confirmationCode = sendConfirmationCode(email, res);
  if (!confirmationCode) return res.sendStatus(400);
  res.sendStatus(200);
};

const handleActivation = async (req, res) => {
  const { activationCode } = req.body;
  console.log(activationCode, typeof activationCode);
  const cookies = req.cookies;
  if (!cookies?.pending_user_email) return res.sendStatus(409);
  if (!cookies?.confirmation_code) return res.sendStatus(409);

  console.log(cookies.confirmation_code, cookies.pending_user_email);
  const userEmail = cookies.pending_user_email;
  const confirmationCode = cookies.confirmation_code;

  let check, email;
  jwt.verify(userEmail, process.env.CONFIRM_CODE_TOKEN, (err, decoded) => {
    if (err) return res.sendStatus(403);
    email = decoded.email;
  });
  jwt.verify(
    confirmationCode,
    process.env.CONFIRM_CODE_TOKEN,
    (err, decoded) => {
      if (err) return res.sendStatus(403);
      check = decoded.code === activationCode;
    }
  );
  if (!check) return res.status(401).json({ error: "Wrong Confirmaion code" });

  const user = await User.findOne({ email: email }).exec();
  if (!user)
    return res.status(400).json({ error: "No User Found by this email" });
  user.userStatus.status = "Active";
  user.userStatus.confirmationCode = " ";
  const updateUser = await user.save();

  await res.clearCookie("pending_user_email", {
    httpOnly: true,
    sameSite: "None",
    secure: true, // process.env.NODE_ENV === 'production'
  });
  console.log(updateUser);

  await res.sendStatus(200);
};

const transporter = nodemailer.createTransport({
  port: process.env.NODE_ENV === "production" ? 465 : 587,
  // service:"gmail",
  host: "smtp.gmail.com",
  secure: process.env.NODE_ENV === "production",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

const sendConfirmationCode = (email: any, response: any) => {
  const code = Math.floor(Math.random() * 90000) + 10000;

  const message = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Activate Your Account",
    // text: "Plaintext version of the message",
    html: `<h2>This is your confimation code for ${process.env.SITE_NAME}</h2> \n <h2>${code}</h2> `,
  };

  const confirmationCode = jwt.sign(
    { code: code },
    process.env.CONFIRM_CODE_TOKEN,
    { expiresIn: "120s" }
  );

  const pendingUserEmail = jwt.sign(
    { email: email },
    process.env.CONFIRM_CODE_TOKEN,
    { expiresIn: "100d" }
  );

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });

  response.cookie("confirmation_code", confirmationCode, {
    httpOnly: true,
    maxAge: 2 * 60 * 1000,
    sameSite: "None",
    secure: true,
  });
  response.cookie("pending_user_email", pendingUserEmail, {
    httpOnly: true,
    maxAge: 100 * 24 * 60 * 60 * 1000,
    sameSite: "None",
    secure: true,
  });

  return confirmationCode;
};

export default {
  register,
  resendActiveCode,
  handleActivation,
  sendConfirmationCode,
};
