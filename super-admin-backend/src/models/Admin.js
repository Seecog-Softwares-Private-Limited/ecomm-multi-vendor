import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ADMIN_STATUS = ["active", "inactive", "suspended"];
const APPROVAL_STATUS = ["pending", "approved", "rejected"];

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    status: { type: String, enum: ADMIN_STATUS, default: "inactive" },
    approvalStatus: { type: String, enum: APPROVAL_STATUS, default: "pending" },
    isSuperAdmin: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// email already has unique: true (creates index). Only add compound/other indexes.
adminSchema.index({ status: 1, approvalStatus: 1 });
adminSchema.index({ role: 1 });

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const Admin = mongoose.model("Admin", adminSchema);
export { ADMIN_STATUS, APPROVAL_STATUS };
