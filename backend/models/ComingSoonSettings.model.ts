import mongoose, { Schema, Document } from "mongoose";

export interface IComingSoonSettings extends Document {
  isEnabled: boolean;
  launchDate?: Date;
  headline: string;
  subtext: string;
  updatedAt: Date;
  createdAt: Date;
}

const ComingSoonSettingsSchema = new Schema<IComingSoonSettings>(
  {
    isEnabled: {
      type: Boolean,
      default: false,
      index: true,
    },
    launchDate: {
      type: Date,
    },
    headline: {
      type: String,
      default: "¡Algo emocionante está en camino!",
      trim: true,
    },
    subtext: {
      type: String,
      default:
        "<p>GoGame es una experiencia sorpresa de viajes deportivos. Sé el primero en saber cuándo lanzaremos.</p>",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "coming_soon_settings",
  },
);

export default mongoose.models.ComingSoonSettings ||
  mongoose.model<IComingSoonSettings>(
    "ComingSoonSettings",
    ComingSoonSettingsSchema,
  );
