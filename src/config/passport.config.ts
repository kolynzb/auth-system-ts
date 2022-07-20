import passportLocal from "passport-local";
import passportGoogle from "passport-google-oauth20";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import { PassportStatic } from "passport";

const LocalStrategy = passportLocal.Strategy;
const GoogleStrategy = passportGoogle.Strategy;

// initialize passport function
export default (passport: PassportStatic) => {
  const authenticateGoogleUser = async (
    accessToken,
    refreshToken,
    profile,
    done
  ) => {
    const foundUser = await User.findOne({ googleid: profile.id });
    if (foundUser) {
      console.log(foundUser);
      done(null, foundUser);
    } else {
      console.log(profile.name.givenName);
      console.log(profile.name.familyName);
      const newUser = await User.create({
        first_name: profile.name.givenName || "",
        last_name: profile.name.familyName || "",
        email: profile._json.email,
        googleid: profile.id,
      });

      console.log(newUser);
      done(null, newUser);
    }
  };

  passport.use(
    new GoogleStrategy(
      {
        callbackURL: "/auth/google/redirect",
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
      authenticateGoogleUser
    )
  );

  const authenticateUser: passportLocal.VerifyFunction = async (
    email,
    password,
    done
  ) => {
    const foundUser = await User.findOne({ email: email });
    if (!foundUser)
      return done(null, false, { message: "No user with that email" });
    try {
      if (await bcrypt.compare(password, foundUser.password as string)) {
        return done(null, foundUser);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    } catch (err) {
      return done(err);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

  passport.serializeUser((user: any, done: any) => {
    done(null, user._id);
  });

  passport.deserializeUser((id: any, done: any) => {
    User.findById(id).then((user) => {
      if (user) {
        const userInfo = {
          username: user.first_name + " " + user.last_name,
          email: user.email,
          roles: user.roles,
        };
        console.log("user  hai", userInfo);
        done(null, userInfo);
      } else {
        done(null, false);
      }
    });
  });
};
