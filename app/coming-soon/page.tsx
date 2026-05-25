import connectToDatabase from "@/backend/lib/mongoose";
import ComingSoonClient from "./components/ComingSoonClient";
import { SettingsService } from "@/backend";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
  headline: "¡Algo emocionante está en camino!",
  subtext:
    "<p>GoGame es una experiencia sorpresa de viajes deportivos. Sé el primero en saber cuándo lanzaremos.</p>",
  privacyNote:
    "Nada de spam, nunca. Solo nos pondremos en contacto contigo cuando sea hora de jugar. 🎮",
};

export default async function ComingSoonPage() {
  await connectToDatabase();
  const settings = await SettingsService.getComingSoonSettings();

  return (
    <ComingSoonClient
      headline={settings.headline || DEFAULT_SETTINGS.headline}
      subtext={settings.subtext || DEFAULT_SETTINGS.subtext}
      privacyNote={settings.privacyNote || DEFAULT_SETTINGS.privacyNote}
      launchDate={settings.launchDate ? settings.launchDate.toISOString() : null}
    />
  );
}
