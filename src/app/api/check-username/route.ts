import { z } from "zod";
import dbConnect from "@/lib/dbConnect";
import User from "../.././../models/user.model";
import { usernameValidation } from "../../../schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return Response.json({ success: false, message: "Username is required" }, { status: 400 });
    }

    const result = UsernameQuerySchema.safeParse({ username });
    if (!result.success) {
      return Response.json({
        success: false,
        message: result.error.issues[0].message,
      }, { status: 400 });
    }

    const existingVerifiedUser = await User.findOne({
      username: result.data.username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json({ success: false, message: "Username already taken" }, { status: 409 });
    }

    return Response.json({ success: true, message: "Username is available" }, { status: 200 });

  } catch (error) {
    console.error("Error checking username:", error);
    return Response.json({ success: false, message: "Error checking username" }, { status: 500 });
  }
}