import mongoose, { Schema, type InferSchemaType } from "mongoose";

const inquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    company: { type: String, trim: true },
    projectType: { type: String, required: true },
    budget: { type: String, required: true },
    message: { type: String, required: true },
    locale: { type: String },
    status: { type: String, enum: ["new", "in-review", "won", "archived"], default: "new" },
  },
  { timestamps: true }
);

export type InquiryDoc = InferSchemaType<typeof inquirySchema>;

export const Inquiry =
  (mongoose.models.Inquiry as mongoose.Model<InquiryDoc>) ??
  mongoose.model<InquiryDoc>("Inquiry", inquirySchema);
