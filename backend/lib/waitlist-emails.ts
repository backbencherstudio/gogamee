import { emailQueue } from "./email-queue";

interface WaitlistEmailPayload {
  email: string;
  name?: string;
}

const SUPPORT_EMAIL =
  process.env.MAIL_TO || process.env.MAIL_USER || "info@gogame2025.com";

function getMailFrom() {
  return process.env.MAIL_FROM || process.env.MAIL_USER;
}

function getInternalRecipient() {
  return (
    process.env.WAITLIST_NOTIFY_EMAIL ||
    process.env.MAIL_TO ||
    process.env.MAIL_USER
  );
}

function formatEmailDateTime(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function createEmailShell(content: {
  title: string;
  eyebrow?: string;
  intro: string;
  sections: string;
  footerNote?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background-color: #f0f4f8; font-family: Arial, sans-serif;">
  <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #6AAD3C 0%, #4a8a27 100%); padding: 36px 30px; text-align: center;">
      <p style="margin: 0 0 6px; color: rgba(255,255,255,0.8); font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">${content.eyebrow || "GoGame"}</p>
      <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">${content.title}</h1>
    </div>

    <div style="padding: 24px 30px; border-bottom: 1px solid #eee; background-color: #fafffe;">
      <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
        ${content.intro}
      </p>
    </div>

    ${content.sections}

    <div style="background-color: #f9f9f9; padding: 24px 30px; text-align: center; border-top: 1px solid #eee;">
      <p style="margin: 0 0 6px; color: #555; font-size: 13px;">¿Necesitas ayuda? Contáctanos en</p>
      <p style="margin: 0 0 6px; color: #6AAD3C; font-size: 13px; font-weight: 600;">${SUPPORT_EMAIL}</p>
      <p style="margin: 14px 0 0; color: #aaa; font-size: 11px;">${content.footerNote || `© ${new Date().getFullYear()} GoGame. Todos los derechos reservados.`}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function createWelcomeTemplate(email: string) {
  const sections = `
    <div style="padding: 24px 30px; border-bottom: 1px solid #eee;">
      <h3 style="margin: 0 0 14px; color: #6AAD3C; font-size: 16px;">👋 ¡Bienvenido a la comunidad de GoGame!</h3>
      <div style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="padding: 14px 16px; background-color: #ffffff; border-bottom: 1px solid #f0f0f0; color: #333; font-size: 14px; line-height: 1.7;">
          Gracias por unirte a la comunidad de GoGame.
        </div>
        <div style="padding: 14px 16px; background-color: #fafafa; border-bottom: 1px solid #f0f0f0; color: #333; font-size: 14px; line-height: 1.7;">
          Hemos recibido correctamente tu email y, a partir de ahora, podrás recibir noticias, novedades y futuras actualizaciones relacionadas con GoGame.
        </div>
        <div style="padding: 14px 16px; background-color: #ffffff; color: #333; font-size: 14px; line-height: 1.7;">
          Nos hace mucha ilusión tenerte con nosotros ⚽🏀
        </div>
      </div>
    </div>

    <div style="padding: 24px 30px; border-bottom: 1px solid #eee;">
      <h3 style="margin: 0 0 14px; color: #6AAD3C; font-size: 16px;">📩 Email registrado</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <tr>
          <td style="padding: 10px 12px; color: #666; font-size: 13px; width: 40%; border-bottom: 1px solid #f0f0f0;">Correo electrónico</td>
          <td style="padding: 10px 12px; color: #222; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f0f0f0;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; color: #666; font-size: 13px;">Estado</td>
          <td style="padding: 10px 12px; color: #222; font-size: 14px; font-weight: 600;">Registrado en la waitlist</td>
        </tr>
      </table>
    </div>
  `;

  return createEmailShell({
    title: "¡Ya estás dentro!",
    intro:
      "Hola, hemos confirmado tu registro en la waitlist de GoGame. Te avisaremos cuando tengamos novedades importantes para compartir contigo.",
    sections,
  });
}

function createInternalTemplate({
  email,
  name,
  internalTimestamp,
}: {
  email: string;
  name?: string;
  internalTimestamp: string;
}) {
  const sections = `
    <div style="padding: 24px 30px; border-bottom: 1px solid #eee;">
      <h3 style="margin: 0 0 14px; color: #6AAD3C; font-size: 16px;">📥 Nueva suscripción a la waitlist</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <tr>
          <td style="padding: 10px 12px; color: #666; font-size: 13px; width: 40%; border-bottom: 1px solid #f0f0f0;">Email</td>
          <td style="padding: 10px 12px; color: #222; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f0f0f0;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; color: #666; font-size: 13px; width: 40%; border-bottom: 1px solid #f0f0f0;">Nombre</td>
          <td style="padding: 10px 12px; color: #222; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f0f0f0;">${name?.trim() || "Not provided"}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; color: #666; font-size: 13px; width: 40%; border-bottom: 1px solid #f0f0f0;">Source</td>
          <td style="padding: 10px 12px; color: #222; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f0f0f0;">coming-soon-page</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; color: #666; font-size: 13px; width: 40%;">Time</td>
          <td style="padding: 10px 12px; color: #222; font-size: 14px; font-weight: 600;">${internalTimestamp}</td>
        </tr>
      </table>
    </div>

    <div style="padding: 24px 30px; border-bottom: 1px solid #eee;">
      <div style="margin: 0; padding: 20px; background-color: #e3f2fd; border-bottom: 1px solid #90caf9; border-radius: 8px;">
        <h3 style="margin: 0 0 6px; color: #1565c0; font-size: 15px;">🤝 Seguimiento recomendado</h3>
        <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
          Este usuario ya quedó registrado correctamente. Puedes usar este correo para futuras campañas, avisos de lanzamiento o seguimiento comercial.
        </p>
      </div>
    </div>
  `;

  return createEmailShell({
    title: "New Waitlist Signup",
    eyebrow: "GoGame Admin",
    intro:
      "Se ha registrado una nueva persona en la waitlist pública de GoGame. Aquí tienes los detalles del contacto.",
    sections,
    footerNote: "GoGame Admin Notification",
  });
}

export async function queueWaitlistSignupEmails({
  email,
  name,
}: WaitlistEmailPayload) {
  const mailFrom = getMailFrom();

  if (!mailFrom) {
    console.warn(
      "[Waitlist Email] MAIL_FROM/MAIL_USER is not configured. Skipping waitlist emails.",
    );
    return;
  }

  const welcomeHtml = createWelcomeTemplate(email);
  const welcomeText = [
    "¡Hola!",
    "",
    "Gracias por unirte a la comunidad de GoGame.",
    "",
    "Hemos recibido correctamente tu email y, a partir de ahora, podrás recibir noticias, novedades y futuras actualizaciones relacionadas con GoGame.",
    "",
    `Email registrado: ${email}`,
    "Estado: Registrado en la waitlist",
    "",
    "Nos hace mucha ilusión tenerte con nosotros ⚽🏀",
    "",
    "— El equipo de GoGame",
  ].join("\n");

  const fromHeader = `"GoGame" <${mailFrom}>`;

  await emailQueue.addToQueue({
    to: email,
    from: fromHeader,
    subject: "Bienvenido a la comunidad de GoGame",
    html: welcomeHtml,
    text: welcomeText,
    type: "contact",
  });

  const internalRecipient = getInternalRecipient();
  if (!internalRecipient) {
    console.warn(
      "[Waitlist Email] No internal recipient configured. Skipping admin notification email.",
    );
    return;
  }

  const internalDate = new Date();
  const internalTimestamp = formatEmailDateTime(internalDate);
  const internalHtml = createInternalTemplate({
    email,
    name,
    internalTimestamp,
  });
  const internalText = [
    "New waitlist signup",
    `Email: ${email}`,
    `Name: ${name?.trim() || "Not provided"}`,
    "Source: coming-soon-page",
    `Time: ${internalTimestamp}`,
  ].join("\n");

  await emailQueue.addToQueue({
    to: internalRecipient,
    from: fromHeader,
    subject: `New waitlist signup - ${email}`,
    html: internalHtml,
    text: internalText,
    replyTo: email,
    type: "admin_notification",
  });
}
