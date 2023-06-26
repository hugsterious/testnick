import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  userId: string;
  username: string;
  password: string;
  role: string;
  manager?: string;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "manager", "user"], default: "user" },
    manager: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
