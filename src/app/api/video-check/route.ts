import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { uploadonCloudinary } from "../../../utils/cloudinary";
import dbConnect from "@/lib/dbConnect";
import User from "../../../models/user.model";
import Video from "../../../models/video.model";
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
    const file = formData.get("video") as File;
    if (!file) {
      return NextResponse.json({ success: false, message: "No video provided" }, { status: 400 });
    }

    // 4. Save to temp file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);
    fs.writeFileSync(tempPath, buffer);

    // 5. Upload to Cloudinary
    const cloudinaryResult = await uploadonCloudinary(tempPath);
    if (!cloudinaryResult) {
      return NextResponse.json({ success: false, message: "Failed to upload video" }, { status: 500 });
    }

    const publicId = cloudinaryResult.public_id;
    const duration = Math.floor(cloudinaryResult.duration ?? 10);

    // 6. Build frame URLs (1 frame every 2 seconds, max 10 frames)
    const interval = 2;
    const maxFrames = 10;
    const frameUrls: string[] = [];

    for (let sec = 0; sec < duration && frameUrls.length < maxFrames; sec += interval) {
      frameUrls.push(
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/so_${sec}/${publicId}.jpg`
      );
    }

    // 7. Run each frame through HF model
    const results: string[] = [];

    for (const frameUrl of frameUrls) {
      try {
        const frameResponse = await fetch(frameUrl);
        const frameBuffer = await frameResponse.arrayBuffer();

        const hfResponse = await fetch(
          "https://router.huggingface.co/hf-inference/models/prithivMLmods/deepfake-detector-model-v1",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.HF_TOKEN}`,
              "Content-Type": "image/jpeg",
            },
            body: frameBuffer,
          }
        );

        if (!hfResponse.ok) continue;

        const hfData = await hfResponse.json();
        results.push(hfData[0].label); // "Fake" or "Real"
      } catch (err) {
        console.error(`Frame error at ${frameUrl}:`, err);
        continue; // skip failed frames, don't crash
      }
    }

    if (results.length === 0) {
      return NextResponse.json({ success: false, message: "Could not analyze any frames" }, { status: 500 });
    }

    // 8. Majority vote
    const fakeCount = results.filter(r => r === "Fake").length;
    const finalResult: "Fake" | "Real" = fakeCount > results.length / 2 ? "Fake" : "Real";

    // 9. Save to Video model
    const videoRecord = new Video({
      owner: session.user._id,
      originalUrl: cloudinaryResult.secure_url,
      classification: finalResult,
    });
    await videoRecord.save();

    // 10. Deduct token
    user.tokensRemaining -= 1;
    await user.save();

    // 11. Return result
    return NextResponse.json({
      success: true,
      result: finalResult,
      fileUrl: cloudinaryResult.secure_url,
      tokensRemaining: user.tokensRemaining,
      framesAnalyzed: results.length,
    }, { status: 200 });

  } catch (error) {
    console.error("Video check error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}