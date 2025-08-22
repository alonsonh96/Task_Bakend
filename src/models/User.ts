import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId,
    email: string;
    password: string;
    name: string;
    confirmed: boolean;
}

const userSchema: Schema<IUser> = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    confirmed: {
        type: Boolean,
        default: false,
    },
});

export const User = mongoose.model<IUser>("User", userSchema);