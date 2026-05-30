import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
    username: string;
    fullname: string;
    email: string;
    password: string;
    tokensRemaining: number;
    isVerified: boolean;
    verifyCode: string;
    verifyCodeExpiry: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyCode: { type: String, required: true },
    verifyCodeExpiry: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    tokensRemaining: { type: Number, default: 10 },
}, { timestamps: true });

const User = (mongoose.models.User || mongoose.model<User>('User', UserSchema));
export default User;