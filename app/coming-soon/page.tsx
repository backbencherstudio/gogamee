import connectToDatabase from "@/backend/lib/mongoose";
import ComingSoonClient from "./components/ComingSoonClient";
import { SettingsService } from "@/backend";

export const dynamic = "force-dynamic";

export default async function ComingSoonPage() {
  await connectToDatabase();
  const settings = await SettingsService.getComingSoonSettings();

  const defaultHeadline = "¡Algo emocionante está en camino!";
  const defaultSubtext = "<p>GoGame es una experiencia sorpresa de viajes deportivos. Sé el primero en saber cuándo lanzaremos.</p>";

  return (
    <ComingSoonClient
      headline={settings.headline || defaultHeadline}
      subtext={settings.subtext || defaultSubtext}
      launchDate={
        settings.launchDate ? settings.launchDate.toISOString() : null
      }
    />
  );
}
