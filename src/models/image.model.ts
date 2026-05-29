import mongoose, { Document, Schema } from 'mongoose';

export interface Image extends Document {
    owner: mongoose.Types.ObjectId;
    originalUrl: string;
    classification: "Real" | "Fake";
    analyzedAt: Date;
}

const ImageSchema: Schema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalUrl: { type: String, required: true },
    classification: { type: String, enum: ["Real", "Fake"], required: true },
    analyzedAt: { type: Date, default: Date.now },
});

const Image = mongoose.model<Image>('Image', ImageSchema);
export default Image;