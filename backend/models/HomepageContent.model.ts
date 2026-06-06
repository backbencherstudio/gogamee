import mongoose, { Schema, Document } from "mongoose";

export interface IHomepageStep {
  title: string;
  description: string;
}

export interface IHomepageContent extends Document {
  heroTitle: string;
  heroSubtitle: string;
  howItWorksTitle: string;
  howItWorksIntro: string;
  steps: IHomepageStep[];
  updatedAt: Date;
  createdAt: Date;
}

const DEFAULT_STEPS: IHomepageStep[] = [
  {
    title: "Personaliza tu aventura",
    description:
      "Cuéntanos tu deporte favorito (fútbol o basket), desde qué ciudad sales y cuántas personas sois.",
  },
  {
    title: "Nosotros preparamos la sorpresa",
    description:
      "Nos encargamos de reservar tus vuelos, el hotel y las entradas al partido. Tú solo tienes que esperar al gran momento sorpresa.",
  },
  {
    title: "Prepárate para irte",
    description:
      "Recibirás tu plan de viaje secreto. Haz la maleta y empieza a emocionarte: sabrás tu destino unos días antes.",
  },
  {
    title: "Vive la experiencia",
    description:
      "Disfruta del partido, explora una nueva ciudad y crea recuerdos inolvidables.",
  },
];

const HomepageStepSchema = new Schema<IHomepageStep>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const HomepageContentSchema = new Schema<IHomepageContent>(
  {
    heroTitle: {
      type: String,
      default: "¿Listo para vivir el deporte como nunca antes?",
      trim: true,
    },
    heroSubtitle: {
      type: String,
      default:
        "Deja que tu pasión por el fútbol o el baloncesto te lleve a un destino inesperado. El lugar final es una sorpresa.",
      trim: true,
    },
    howItWorksTitle: {
      type: String,
      default: "Cómo funciona GoGame",
      trim: true,
    },
    howItWorksIntro: {
      type: String,
      default:
        "Sigue unos pasos muy sencillos y nosotros te sorprenderemos con el viaje deportivo perfecto, totalmente organizado.",
      trim: true,
    },
    steps: {
      type: [HomepageStepSchema],
      default: DEFAULT_STEPS,
      validate: {
        validator: (steps: IHomepageStep[]) => steps.length === 4,
        message: "Homepage content must include exactly 4 steps",
      },
    },
  },
  {
    timestamps: true,
    collection: "homepage_content",
  },
);

export const defaultHomepageContent = {
  heroTitle: "¿Listo para vivir el deporte como nunca antes?",
  heroSubtitle:
    "Deja que tu pasión por el fútbol o el baloncesto te lleve a un destino inesperado. El lugar final es una sorpresa.",
  howItWorksTitle: "Cómo funciona GoGame",
  howItWorksIntro:
    "Sigue unos pasos muy sencillos y nosotros te sorprenderemos con el viaje deportivo perfecto, totalmente organizado.",
  steps: DEFAULT_STEPS,
};

export default mongoose.models.HomepageContent ||
  mongoose.model<IHomepageContent>("HomepageContent", HomepageContentSchema);
