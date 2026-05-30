import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { uploadVideoBufferToCloudinary } from "../../../utils/cloudinary";
import dbConnect from "@/lib/dbConnect";
import User from "../../../models/user.model";
import Video from "../../../models/video.model";

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
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No video provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { success: false, message: "Only video files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Video must be under 25MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cloudinaryResult = await uploadVideoBufferToCloudinary(buffer);

    if (!cloudinaryResult) {
      return NextResponse.json(
        { success: false, message: "Failed to upload video" },
        { status: 500 }
      );
    }

    const publicId = cloudinaryResult.public_id;
    const duration = Math.floor(cloudinaryResult.duration ?? 10);

    const interval = 2;
    const maxFrames = 10;
    const frameUrls: string[] = [];

    for (
      let sec = 0;
      sec < duration && frameUrls.length < maxFrames;
      sec += interval
    ) {
      frameUrls.push(
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/so_${sec}/${publicId}.jpg`
      );
    }

    const results: string[] = [];

    for (const frameUrl of frameUrls) {
      try {
        const frameResponse = await fetch(frameUrl);

        if (!frameResponse.ok) {
          console.error("Frame fetch failed:", frameUrl, frameResponse.status);
          continue;
        }

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

        if (!hfResponse.ok) {
          const errorText = await hfResponse.text();
          console.error("HF frame error:", hfResponse.status, errorText);
          continue;
        }

        const hfData = await hfResponse.json();

        if (hfData?.[0]?.label) {
          results.push(hfData[0].label);
        }
      } catch (err) {
        console.error(`Frame error at ${frameUrl}:`, err);
        continue;
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, message: "Could not analyze any frames" },
        { status: 500 }
      );
    }

    const fakeCount = results.filter((r) => r === "Fake").length;

    const finalResult: "Fake" | "Real" =
      fakeCount > results.length / 2 ? "Fake" : "Real";

    const videoRecord = new Video({
      owner: session.user._id,
      originalUrl: cloudinaryResult.secure_url,
      classification: finalResult,
    });

    await videoRecord.save();

    user.tokensRemaining -= 1;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        result: finalResult,
        fileUrl: cloudinaryResult.secure_url,
        tokensRemaining: user.tokensRemaining,
        framesAnalyzed: results.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Video check error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}