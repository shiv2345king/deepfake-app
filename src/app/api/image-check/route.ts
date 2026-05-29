import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { uploadonCloudinary } from "../../../utils/cloudinary";
import dbConnect from "@/lib/dbConnect";
import User from "../../../models/user.model";
import Image from "../../../models/image.model";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 2. Token check
    const user = await User.findById(session.user._id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    if (user.tokensRemaining <= 0) {
      return NextResponse.json({ success: false, message: "No tokens remaining" }, { status: 403 });
    }

    // 3. Get file from formData
    const formData = await request.formData();
    const file = formData.get("image") as File;
    if (!file) {
      return NextResponse.json({ success: false, message: "No image provided" }, { status: 400 });
    }

    // 4. Save to temp file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);
    fs.writeFileSync(tempPath, buffer);

    // 5. Upload to Cloudinary
    const cloudinaryResult = await uploadonCloudinary(tempPath);
    if (!cloudinaryResult) {
      return NextResponse.json({ success: false, message: "Failed to upload image" }, { status: 500 });
    }

    // 6. Send buffer to HF model
    const hfResponse = await fetch(
      "https://router.huggingface.co/hf-inference/models/prithivMLmods/deepfake-detector-model-v1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "image/jpeg",
        },
        body: buffer,
      }
    );

    if (!hfResponse.ok) {
      return NextResponse.json({ success: false, message: "Deepfake detection failed" }, { status: 500 });
    }

    const hfData = await hfResponse.json();
    const result = hfData[0].label as "Fake" | "Real";

    // 7. Save to Image model
    const imageRecord = new Image({
      owner: session.user._id,
      originalUrl: cloudinaryResult.secure_url,
      classification: result,
    });
    await imageRecord.save();

    // 8. Deduct token
    user.tokensRemaining -= 1;
    await user.save();

    // 9. Return result
    return NextResponse.json({
      success: true,
      result,
      fileUrl: cloudinaryResult.secure_url,
      tokensRemaining: user.tokensRemaining,
    }, { status: 200 });

  } catch (error) {
    console.error("Image check error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}