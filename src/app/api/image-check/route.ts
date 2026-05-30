import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { uploadImageBufferToCloudinary } from "../../../utils/cloudinary";
import dbConnect from "@/lib/dbConnect";
import User from "../../../models/user.model";
import Image from "../../../models/image.model";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user._id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.tokensRemaining <= 0) {
      return NextResponse.json(
        { success: false, message: "No tokens remaining" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No image provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Image must be under 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cloudinaryResult = await uploadImageBufferToCloudinary(buffer);

    if (!cloudinaryResult) {
      return NextResponse.json(
        { success: false, message: "Failed to upload image" },
        { status: 500 }
      );
    }

    const hfResponse = await fetch(
      "https://router.huggingface.co/hf-inference/models/prithivMLmods/deepfake-detector-model-v1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": file.type || "image/jpeg",
        },
        body: buffer,
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("HF response error:", hfResponse.status, errorText);

      return NextResponse.json(
        { success: false, message: "Deepfake detection failed" },
        { status: 500 }
      );
    }

    const hfData = await hfResponse.json();
    const result = hfData?.[0]?.label as "Fake" | "Real";

    if (!result) {
      console.error("Invalid HF response:", hfData);

      return NextResponse.json(
        { success: false, message: "Invalid model response" },
        { status: 500 }
      );
    }

    const imageRecord = new Image({
      owner: session.user._id,
      originalUrl: cloudinaryResult.secure_url,
      classification: result,
    });

    await imageRecord.save();

    user.tokensRemaining -= 1;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        result,
        fileUrl: cloudinaryResult.secure_url,
        tokensRemaining: user.tokensRemaining,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Image check error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}