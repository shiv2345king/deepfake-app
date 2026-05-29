import dbConnect from "../../../../lib/dbConnect";
import User  from'../../../models/user.model';
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "../../../helper/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingVerifiedUserByUsername = await User.findOne({
      username: normalizedUsername,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await User.findOne({
      email: normalizedEmail,
    });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000);

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          { status: 400 }
        );
      }

      existingUserByEmail.username = normalizedUsername;
      existingUserByEmail.password = hashedPassword;
      existingUserByEmail.verifyCode = verifyCode;
      existingUserByEmail.verifyCodeExpiry = verifyCodeExpiry;

      await existingUserByEmail.save();
    } else {
      const newUser = new User({
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        verifyCode:verifyCode,
        verifyCodeExpiry: verifyCodeExpiry,
        isVerified: false,
        tokensRemaining: 10,
      });

      await newUser.save();
    }

    const emailResponse = await sendVerificationEmail(
      normalizedEmail,
      normalizedUsername,
      verifyCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);

    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}