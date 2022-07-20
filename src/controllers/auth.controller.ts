import User from "../models/user.model";
import bcrypt from "bcrypt";
const { sendConfirmationCode } = require("../config/confirmActivateCode");

const handleRegister = async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = { handleRegister };
