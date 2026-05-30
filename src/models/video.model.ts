import mongoose, { Document, Schema } from 'mongoose';

export interface Video extends Document {
    owner: mongoose.Types.ObjectId;
    originalUrl: string;
    classification: "Real" | "Fake";
    analyzedAt: Date;
}

const VideoSchema: Schema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalUrl: { type: String, required: true },
    classification: { type: String, enum: ["Real", "Fake"], required: true },
    analyzedAt: { type: Date, default: Date.now },
});

const Video = mongoose.models.Video || mongoose.model<Video>('Video', VideoSchema);
export default Video;