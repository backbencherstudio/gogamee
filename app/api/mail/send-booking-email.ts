// Shared email sending function that can be imported directly
import { emailQueue } from "@/backend/lib/email-queue";
import { transporter } from "@/backend/lib/mail-transport";
import { IBooking } from "@/backend/models/Booking.model";

// Basic interface for Booking Data
export interface BookingData {
  id?: string;
  _id?: string;
  bookingReference?: string;
  fullName?: string;
  travelers?: {
    primaryContact?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    totalCount?: number;
    list?: {
      name?: string;
      type?: string;
      dateOfBirth?: string;
      documentType?: string;
      documentNumber?: string;
      isPrimary?: boolean;
    }[];
  };
  selection?: {
    sport?: string;
    city?: string;
    package?: string;
    league?: string;
  };
  leagues?: {
    list?: { name?: string; group?: string; isSelected?: boolean }[];
    removedCount?: number;
  };
  flight?: {
    schedule?: {
      departureBetween?: string;
      returnBetween?: string;
    };
    preferences?: {
      departureTimeStart?: number;
      departureTimeEnd?: number;
      arrivalTimeStart?: number;
      arrivalTimeEnd?: number;
      hasPreferences?: boolean;
    };
  };
  destinationCity?: string;
  assignedMatch?: string;
  departureDateFormatted?: string;
  returnDateFormatted?: string;
  selectedPackage?: string;
  totalPeople?: number;
  selectedCity?: string;
  selectedLeague?: string;
  totalCost?: number;
  payment_status?: string;
  payment?: {
    status?: string;
  };
  extras?: {
    totalCost?: number;
    selected?: any[];
  };
  priceBreakdown?: {
    items: {
      description: string;
      amount: number;
      quantity: number;
      unitPrice?: number;
    }[];
    packageCost?: number;
    totalCost: number;
  };
  totalExtrasCost?: number;
  bookingExtras?: any[];
  dates?: {
    departure?: string;
    return?: string;
    durationDays?: number;
    durationNights?: number;
  };
}

// Helper to format dates
function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Simple email styles
const STYLES = {
  container:
    "max-width: 600px; margin: 0 auto; background-color: #ffffff; font-family: Arial, sans-serif;",
  header: "background-color: #6AAD3C; padding: 30px; text-align: center;",
  headerTitle: "margin: 0; color: #ffffff; font-size: 24px;",
  section: "padding: 20px; border-bottom: 1px solid #eee;",
  label: "color: #666; font-size: 13px; margin-bottom: 4px;",
  value: "color: #333; font-size: 15px; font-weight: 600; margin: 0;",
  footer: "background-color: #f5f5f5; padding: 20px; text-align: center;",
};

export function generateUserEmailContent(
  booking: IBooking,
  options?: { showReveal?: boolean },
) {
  const showReveal = options?.showReveal ?? true;
  const bookingData = booking as unknown as BookingData;
  const bookingId =
    bookingData.bookingReference ||
    bookingData._id?.toString() ||
    bookingData.id;
  const fullName =
    bookingData.travelers?.primaryContact?.name ||
    bookingData.fullName ||
    "Guest";
  const phone = bookingData.travelers?.primaryContact?.phone || "";
  const destinationCity = bookingData.destinationCity;
  const assignedMatch = bookingData.assignedMatch;
  const selectedPackage =
    bookingData.selection?.package || bookingData.selectedPackage;
  const selectedCity = bookingData.selection?.city || bookingData.selectedCity;
  const selectedSport = bookingData.selection?.sport;
  const selectedLeagueCategory = bookingData.selection?.league || "";
  const departureDateFormatted =
    bookingData.departureDateFormatted ||
    formatDate(bookingData.dates?.departure);
  const returnDateFormatted =
    bookingData.returnDateFormatted || formatDate(bookingData.dates?.return);
  const durationDays = bookingData.dates?.durationDays || "";
  const durationNights = bookingData.dates?.durationNights || "";
  const totalPeople =
    bookingData.travelers?.totalCount || bookingData.totalPeople || 0;
  const travelerList = bookingData.travelers?.list || [];
  const selectedExtras: any[] =
    bookingData.extras?.selected || bookingData.bookingExtras || [];
  const selectedLeagues = (bookingData.leagues?.list || []).filter(
    (l: any) => l.isSelected,
  );
  const flightSchedule = bookingData.flight?.schedule;

  const isPaid =
    bookingData.payment?.status === "paid" ||
    bookingData.payment_status === "paid";
  const totalCost = bookingData.totalCost || 0;

  const subject =
    showReveal && destinationCity
      ? `¡Tu Viaje Ha Sido Revelado! #${bookingId}`
      : `¡Reserva Confirmada! #${bookingId}`;

  // Row helper
  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding: 8px 10px; color: #666; font-size: 13px; width: 40%; border-bottom: 1px solid #f0f0f0;">${label}</td>
      <td style="padding: 8px 10px; color: #222; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f0f0f0;">${value}</td>
    </tr>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f0f4f8; font-family: Arial, sans-serif;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6AAD3C 0%, #4a8a27 100%); padding: 36px 30px; text-align: center;">
          <p style="margin: 0 0 6px; color: rgba(255,255,255,0.8); font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">GoGame</p>
          <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">
            ${showReveal && destinationCity ? "🎉 ¡Tu Destino Ha Sido Revelado!" : "✅ ¡Reserva Confirmada!"}
          </h1>
          <p style="margin: 10px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
            ID De Reserva: <strong>#${bookingId}</strong>
          </p>
        </div>

        <!-- Greeting -->
        <div style="padding: 24px 30px; border-bottom: 1px solid #eee; background-color: #fafffe;">
          <p style="margin: 0; font-size: 15px; color: #333;">
            Hola <strong>${fullName.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ')}</strong>,
          </p>
          <p style="margin: 8px 0 0; color: #555; font-size: 14px; line-height: 1.6;">
            ${
              showReveal && destinationCity
                ? "¡El momento que estabas esperando ha llegado! Tu destino sorpresa ha sido revelado. ¡Prepárate para una experiencia increíble!"
                : "¡Tu reserva ha sido confirmada oficialmente! Tenemos todo organizado para tu próximo viaje deportivo. A continuación encontrarás todos los detalles de tu reserva."
            }
          </p>
        </div>

        <!-- Destination Section -->
        ${
          showReveal && destinationCity && assignedMatch
            ? `<div style="margin: 0; padding: 22px 30px; background-color: #fff8e1; border-bottom: 1px solid #ffe082;">
          <h3 style="margin: 0 0 14px; color: #e65100; font-size: 16px;">🎯 Tu Destino Sorpresa</h3>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${row("Ciudad De Destino", `<span style="color:#e65100">${destinationCity.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ')}</span>`)}
            ${row("Tu Partido", assignedMatch)}
          </table>
        </div>`
            : `<div style="margin: 0; padding: 20px 30px; background-color: #e3f2fd; border-bottom: 1px solid #90caf9;">
          <h3 style="margin: 0 0 6px; color: #1565c0; font-size: 15px;">🤫 Sorpresa Próximamente</h3>
          <p style="margin: 0; color: #555; font-size: 14px;">Tu destino será revelado <strong>unos días antes de la salida</strong>. ¡Mantente atento!</p>
          <p style="margin: 12px 0 0; color: #555; font-size: 13px; line-height: 1.5;"><strong>Ten en cuenta que tu destino podría ser Reino Unido.</strong> Si es así, necesitarás solicitar una autorización electrónica de viaje (ETA). Recuerda que cada viajero es responsable de obtenerla antes del viaje.</p>
        </div>`
        }

        <!-- Booking Overview -->
        <div style="padding: 24px 30px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0 0 14px; color: #6AAD3C; font-size: 16px;">📋 Detalles De La Reserva</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            ${row("ID De Reserva", "#" + bookingId)}
            ${row("Deporte", selectedSport === 'both' ? 'Ambos' : (selectedSport === 'football' ? 'Fútbol' : (selectedSport === 'basketball' ? 'Básquet' : 'N/A')))}
            ${row("Paquete", selectedPackage === 'premium' ? 'Premium' : (selectedPackage === 'standard' ? 'Estándar' : (selectedPackage || "N/A")))}
            ${row("Ciudad De Salida", selectedCity ? selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1).toLowerCase() : "N/A")}
            ${selectedLeagueCategory ? row("Categoría De Liga", selectedLeagueCategory) : ""}
            ${row("Fecha De Salida", departureDateFormatted)}
            ${row("Fecha De Regreso", returnDateFormatted)}
            ${durationDays ? row("Duración", `${durationDays} Día(s)${durationNights ? " / " + durationNights + " Noche(s)" : ""}`) : ""}
            ${row("Viajeros", totalPeople === 1 ? "1 Persona" : totalPeople + " Personas")}
            ${phone ? row("Teléfono De Contacto", phone) : ""}
          </table>
        </div>

        <!-- Flight Schedule -->
        ${
          flightSchedule &&
          (flightSchedule.departureBetween || flightSchedule.returnBetween)
            ? `<div style="padding: 24px 30px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0 0 14px; color: #6AAD3C; font-size: 16px;">✈️ Horario De Vuelos</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            ${flightSchedule.departureBetween && flightSchedule.departureBetween !== "TBD" ? row("Ventana De Vuelo De Salida", flightSchedule.departureBetween) : ""}
            ${flightSchedule.returnBetween && flightSchedule.returnBetween !== "TBD" ? row("Ventana De Vuelo De Regreso", flightSchedule.returnBetween) : ""}
          </table>
        </div>`
            : ""
        }

        <!-- Selected Leagues -->
        ${
          selectedLeagues.length > 0
            ? `<div style="padding: 24px 30px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0 0 14px; color: #6AAD3C; font-size: 16px;">🏆 Ligas Seleccionadas</h3>
          <ul style="margin: 0; padding-left: 20px; color: #444; font-size: 14px; line-height: 2;">
            ${selectedLeagues.map((l: any) => `<li><strong>${l.name}</strong> <span style="color:#888; font-size:12px;">(${l.group})</span></li>`).join("")}
          </ul>
        </div>`
            : ""
        }

        <!-- Travelers List -->
        ${
          travelerList.length > 0
            ? `<div style="padding: 24px 30px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0 0 14px; color: #6AAD3C; font-size: 16px;">👥 Viajeros</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden; font-size: 13px;">
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 8px 10px; text-align: left; color: #555; font-weight: 600;">#</th>
              <th style="padding: 8px 10px; text-align: left; color: #555; font-weight: 600;">Nombre</th>
              <th style="padding: 8px 10px; text-align: left; color: #555; font-weight: 600;">Tipo</th>
              <th style="padding: 8px 10px; text-align: left; color: #555; font-weight: 600;">Documento</th>
            </tr>
            ${travelerList
              .map(
                (t: any, i: number) => `
            <tr style="${i % 2 === 0 ? "background: #fff;" : "background: #fafafa;"}">
              <td style="padding: 8px 10px; color: #888;">${i + 1}</td>
              <td style="padding: 8px 10px; color: #222; font-weight: ${t.isPrimary ? "700" : "400"};">${(t.name || "N/A").split(' ').map((n: string) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ')}${t.isPrimary ? " <span style='color:#6AAD3C;font-size:11px;'>(Principal)</span>" : ""}</td>
              <td style="padding: 8px 10px; color: #555; text-transform: capitalize;">${t.type === 'adult' ? 'Adulto' : (t.type === 'kid' ? 'Niño' : (t.type === 'baby' ? 'Bebé' : (t.type || "Adulto")))}</td>
              <td style="padding: 8px 10px; color: #555;">${t.documentType ? (t.documentType === 'ID' ? 'DNI' : (t.documentType === 'Passport' ? 'Pasaporte' : t.documentType)) + ": " + (t.documentNumber || "") : "N/A"}</td>
            </tr>`,
              )
              .join("")}
          </table>
        </div>`
            : ""
        }

        <!-- Selected Extras -->
        ${
          selectedExtras.filter((e: any) => e.isSelected).length > 0
            ? `<div style="padding: 24px 30px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0 0 14px; color: #6AAD3C; font-size: 16px;">✨ Detalles De Extras Seleccionados</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden; font-size: 14px;">
            ${selectedExtras
              .filter((e: any) => e.isSelected)
              .map(
                (extra: any, i: number) => `
            <tr style="${i % 2 === 0 ? "background:#fff;" : "background:#fafafa;"}">
              <td style="padding: 8px 12px; color: #333;">${extra.name.split(' ').map((n: string) => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ')}${extra.quantity && extra.quantity > 1 ? ` <span style="color:#888;">(x${extra.quantity})</span>` : ""}</td>
              <td style="padding: 8px 12px; color: #4a9e2a; font-weight: 600; text-align: right;">${extra.price === 0 ? "Incluida" : "€" + (extra.price * (extra.quantity || 1)).toFixed(2)}</td>
            </tr>`,
              )
              .join("")}
          </table>
        </div>`
            : ""
        }

        <!-- Payment Summary -->
        <div style="padding: 24px 30px; border-bottom: 1px solid #eee;">
          <h3 style="margin: 0 0 14px; color: #6AAD3C; font-size: 16px;">💳 Resumen Del Pago</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden; font-size: 14px;">
            ${
              bookingData.priceBreakdown?.items &&
              bookingData.priceBreakdown.items.length > 0
                ? bookingData.priceBreakdown.items
                    .map(
                      (item, i) => `
            <tr style="${i % 2 === 0 ? "background:#fff;" : "background:#fafafa;"}">
              <td style="padding: 8px 12px; color: #555;">${item.description.replace('Base Package', 'Paquete Base').replace('both', 'Ambos').replace('premium', 'Premium').replace('standard', 'Estándar').replace('Single Traveler Supplement', 'Suplemento De Viajero Individual')}${(item.quantity || 0) > 1 ? ` (x${item.quantity})` : ""}</td>
              <td style="padding: 8px 12px; text-align: right; font-weight: 500; color: #333;">€${item.amount.toFixed(2)}</td>
            </tr>`,
                    )
                    .join("")
                : `<tr><td style="padding: 8px 12px; color: #555;">Paquete</td><td style="padding: 8px 12px; text-align: right; font-weight: 500;">€${(bookingData.priceBreakdown?.packageCost || 0).toFixed(2)}</td></tr>`
            }
            <tr style="background-color: #f5f5f5; border-top: 2px solid #ddd;">
              <td style="padding: 10px 12px; font-weight: 700; color: #222;">Coste Total</td>
              <td style="padding: 10px 12px; font-weight: 700; color: #222; text-align: right;">€${totalCost.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: #4a9e2a; font-weight: 600;">Cantidad Pagada</td>
              <td style="padding: 8px 12px; color: #4a9e2a; font-weight: 600; text-align: right;">€${(isPaid ? totalCost : 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; color: ${isPaid ? "#888" : "#d32f2f"}; font-weight: 600;">Saldo Pendiente</td>
              <td style="padding: 8px 12px; color: ${isPaid ? "#888" : "#d32f2f"}; font-weight: 600; text-align: right;">€${(isPaid ? 0 : totalCost).toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9f9f9; padding: 24px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0 0 6px; color: #555; font-size: 13px;">¿Necesitas Ayuda? Contáctanos En</p>
          <p style="margin: 0 0 6px; color: #6AAD3C; font-size: 13px; font-weight: 600;">${process.env.MAIL_TO || "info@gogame2025.com"}</p>
          <p style="margin: 14px 0 0; color: #aaa; font-size: 11px;">© ${new Date().getFullYear()} GoGame. Todos Los Derechos Reservados.</p>
        </div>

      </div>
    </body>
    </html>
  `;

  return { subject, htmlContent };
}

export function generateAdminEmailContent(booking: IBooking) {
  const bookingData = booking as any;
  const bookingId = bookingData.bookingReference || booking._id?.toString();
  const fullName = booking.travelers?.primaryContact?.name || "Guest";
  const email = booking.travelers?.primaryContact?.email || "";
  const phone = booking.travelers?.primaryContact?.phone || "";
  const selectedPackage = booking.selection?.package;
  const selectedCity = booking.selection?.city;
  const selectedSport = booking.selection?.sport;
  const departureDateFormatted = formatDate(booking.dates?.departure);
  const returnDateFormatted = formatDate(booking.dates?.return);
  const totalPeople = booking.travelers?.totalCount || 0;
  const paymentStatus = booking.payment?.status || "pending";

  const subject = `New Booking! #${bookingId} - ${fullName}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Booking Notification</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="${STYLES.container}">
        <!-- Header -->
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 20px;">New Booking Received</h1>
        </div>

        <!-- Customer Info -->
        <div style="${STYLES.section}">
          <h2 style="margin: 0; color: #333;">${fullName}</h2>
          <p style="margin: 5px 0; color: #666;">${email}</p>
          <p style="margin: 5px 0; color: #666;">${phone}</p>
          <p style="margin: 10px 0 0;"><span style="background-color: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 12px; font-size: 12px;">${paymentStatus.toUpperCase()}</span></p>
        </div>

        <!-- Booking Details -->
        <div style="${STYLES.section}">
          <h3 style="margin: 0 0 10px; color: #333;">Booking Details</h3>
          <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #f8f9fa;">
            <tr>
              <td style="color: #666;">Booking ID</td>
              <td style="font-weight: 600;">#${bookingId}</td>
            </tr>
            <tr>
              <td style="color: #666;">Package</td>
              <td style="font-weight: 600;">${selectedPackage || "N/A"}</td>
            </tr>
            <tr>
              <td style="color: #666;">Sport</td>
              <td style="font-weight: 600;">${selectedSport || "N/A"}</td>
            </tr>
            <tr>
              <td style="color: #666;">Departure City</td>
              <td style="font-weight: 600;">${selectedCity || "N/A"}</td>
            </tr>
            <tr>
              <td style="color: #666;">Dates</td>
              <td style="font-weight: 600;">${departureDateFormatted} - ${returnDateFormatted}</td>
            </tr>
            <tr>
              <td style="color: #666;">Travelers</td>
              <td style="font-weight: 600;">${totalPeople} People</td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="${STYLES.footer}">
          <p style="margin: 0; color: #999; font-size: 12px;">GoGame Admin Panel</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, htmlContent };
}

export async function sendBookingConfirmationEmail(
  booking: IBooking,
  options?: { showReveal?: boolean },
): Promise<{ success: boolean; message: string; error?: string }> {
  const bookingData = booking as unknown as BookingData;
  const bookingId =
    bookingData.bookingReference ||
    bookingData._id?.toString() ||
    bookingData.id;

  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.error("❌ Email configuration missing");
      return {
        success: false,
        message: "Email service not configured",
        error: "MAIL_USER or MAIL_PASS is missing",
      };
    }

    const email = booking.travelers?.primaryContact?.email;
    if (!email) {
      console.error("❌ Missing email");
      return {
        success: false,
        message: "Email is required",
        error: "Missing email",
      };
    }

    const userEmailContent = generateUserEmailContent(booking, options);

    await transporter.sendMail({
      from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
      to: email,
      subject: userEmailContent.subject,
      html: userEmailContent.htmlContent,
      text: `Booking Confirmed #${bookingId}`,
      replyTo: process.env.MAIL_FROM ?? process.env.MAIL_USER,
    });

    // Send Admin Email
    const adminEmail = process.env.MAIL_TO ?? process.env.MAIL_USER;
    if (adminEmail) {
      try {
        const adminEmailContent = generateAdminEmailContent(booking);
        await transporter.sendMail({
          from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
          to: adminEmail,
          subject: adminEmailContent.subject,
          html: adminEmailContent.htmlContent,
          text: `New Booking #${bookingId}`,
          replyTo: email,
        });
      } catch (adminError) {
        console.error("❌ Failed to send admin email:", adminError);
      }
    }

    return {
      success: true,
      message: "Confirmation emails sent successfully",
    };
  } catch (error) {
    console.error("❌ Error sending email:", error);

    const isTransient =
      error instanceof Error && emailQueue.isTransientError(error);

    if (isTransient) {
      try {
        const userContent = generateUserEmailContent(booking, options);
        const email = booking.travelers?.primaryContact?.email;
        if (email) {
          await emailQueue.addToQueue({
            to: email,
            subject: userContent.subject,
            html: userContent.htmlContent,
            text: `Booking Confirmed #${bookingId}`,
            from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
            replyTo: process.env.MAIL_FROM ?? process.env.MAIL_USER,
            bookingId: booking._id?.toString() || "",
            type: "booking",
          });
        }

        return {
          success: false,
          message: "Email queued for retry",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      } catch (e) {
        console.error("Failed to queue", e);
      }
    }

    return {
      success: false,
      message: "Failed to send email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function queueBookingConfirmationEmails(
  booking: IBooking,
  options?: { showReveal?: boolean; delay?: number },
) {
  const email = booking.travelers?.primaryContact?.email;
  if (!email) {
    console.error("❌ No email found for booking");
    return;
  }

  const bookingData = booking as unknown as BookingData;
  const bookingId =
    bookingData.bookingReference ||
    bookingData._id?.toString() ||
    bookingData.id;

  // Queue User Email
  const userContent = generateUserEmailContent(booking, options);
  await emailQueue.addToQueue(
    {
      to: email,
      subject: userContent.subject,
      html: userContent.htmlContent,
      text: userContent.subject,
      from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
      type: "booking",
      bookingId: booking._id?.toString() || "",
    },
    { delay: options?.delay },
  );

  // Queue Admin Email (Immediate only)
  if (!options?.delay) {
    const adminEmail = process.env.MAIL_TO ?? process.env.MAIL_USER;
    if (adminEmail) {
      const adminContent = generateAdminEmailContent(booking);
      await emailQueue.addToQueue({
        to: adminEmail,
        subject: adminContent.subject,
        html: adminContent.htmlContent,
        text: `New Booking #${bookingId}`,
        from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
        type: "booking",
        bookingId: booking._id?.toString() || "",
        replyTo: email,
      });
    }
  }
}
