import mongoose, { Schema, type InferSchemaType } from "mongoose";

const subscriberSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    source: { type: String, default: "footer" },
  },
  { timestamps: true }
);

export type SubscriberDoc = InferSchemaType<typeof subscriberSchema>;

export const Subscriber =
  (mongoose.models.Subscriber as mongoose.Model<SubscriberDoc>) ??
  mongoose.model<SubscriberDoc>("Subscriber", subscriberSchema);
