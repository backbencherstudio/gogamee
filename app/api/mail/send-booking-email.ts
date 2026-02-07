// Shared email sending function that can be imported directly
import { emailQueue } from "@/backend/lib/email-queue";
import { transporter } from "@/backend/lib/mail-transport";

interface BookingData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  payment_status: string;
  selectedSport: string;
  selectedPackage: string;
  selectedCity: string;
  selectedLeague: string;
  departureDateFormatted: string;
  returnDateFormatted: string;
  totalPeople: number;
  adults: number;
  kids: number;
  babies: number;
  destinationCity?: string | null;
  assignedMatch?: string | null;
  totalExtrasCost: number;
  bookingExtras?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    isSelected: boolean;
  }>;
  allTravelers?: Array<{
    name?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    documentType?: string;
    documentNumber?: string;
    isPrimary?: boolean;
  }>;
  paymentMethod?: string | null;
  [key: string]: any;
}

// Common styles for consistency
const STYLES = {
  container:
    "max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: 'Poppins', Arial, sans-serif;",
  header:
    "background: linear-gradient(135deg, #76C043 0%, #4a9e2a 100%); padding: 40px 30px; text-align: center;",
  headerTitle: "margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;",
  section: "padding: 30px 30px; border-bottom: 1px solid #f0f0f0;",
  label: "color: #666; font-size: 14px; margin-bottom: 4px;",
  value: "color: #333; font-size: 16px; font-weight: 600; margin: 0;",
  footer:
    "background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;",
  button:
    "display: inline-block; background-color: #76C043; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;",
};

export function generateUserEmailContent(
  booking: BookingData,
  options?: { showReveal?: boolean },
) {
  const showReveal = options?.showReveal ?? true;
  const subject =
    showReveal && booking.destinationCity
      ? `🎯 Your Trip Revealed! #${booking.id}`
      : `🎉 Booking Confirmed! #${booking.id} - GoGame`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmed - GoGame</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; color: #333;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
          <td align="center">
            <div style="${STYLES.container}">
              <!-- Header -->
              <div style="${STYLES.header}">
                <h1 style="${STYLES.headerTitle}">${
                  showReveal && booking.destinationCity
                    ? "Your Destination Revealed!"
                    : "Booking Confirmed!"
                }</h1>
                <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">
                  ${
                    showReveal && booking.destinationCity
                      ? "Get ready for " + booking.destinationCity + "!"
                      : "Get ready for your sports adventure 🎉"
                  }
                </p>
              </div>

              <!-- Greeting -->
              <div style="${STYLES.section}">
                <h2 style="margin: 0 0 15px; color: #333;">Hello ${booking.fullName},</h2>
                <p style="margin: 0; line-height: 1.6; color: #555;">
                  ${
                    showReveal && booking.destinationCity
                      ? "The wait is over! We are excited to reveal your surprise destination and match details."
                      : "Thank you for booking with GoGame! We're thrilled to confirm your surprise trip. Below are the details of your upcoming adventure."
                  }
                </p>
              </div>

              <!-- Key Details Grid -->
              <div style="padding: 30px; background-color: #F1F9EC;">
                <h3 style="margin: 0 0 20px; color: #4a9e2a; font-size: 18px;">📋 Trip Summary</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" style="padding-bottom: 20px;">
                      <div style="${STYLES.label}">Booking ID</div>
                      <div style="${STYLES.value}">#${booking.id}</div>
                    </td>
                    <td width="50%" style="padding-bottom: 20px;">
                      <div style="${STYLES.label}">Travel Dates</div>
                      <div style="${STYLES.value}">${booking.departureDateFormatted} - ${booking.returnDateFormatted}</div>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="padding-bottom: 20px;">
                      <div style="${STYLES.label}">Package</div>
                      <div style="${STYLES.value}">${booking.selectedPackage}</div>
                    </td>
                    <td width="50%" style="padding-bottom: 20px;">
                      <div style="${STYLES.label}">Travelers</div>
                      <div style="${STYLES.value}">${booking.totalPeople} Person(s)</div>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%">
                      <div style="${STYLES.label}">Departure City</div>
                      <div style="${STYLES.value}">${booking.selectedCity}</div>
                    </td>
                    <td width="50%">
                      <div style="${STYLES.label}">League</div>
                      <div style="${STYLES.value}">${booking.selectedLeague}</div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Surprise Destination Section -->
              <div style="${STYLES.section}">
                ${
                  showReveal && booking.destinationCity && booking.assignedMatch
                    ? `
                  <div style="background-color: #fff8e1; border: 2px dashed #ffc107; border-radius: 12px; padding: 20px; text-align: center;">
                    <h3 style="margin: 0 0 10px; color: #f57f17;">🎯 Your Surprise Revealed!</h3>
                    <p style="margin: 5px 0; font-size: 18px;"><strong>Destination:</strong> ${booking.destinationCity}</p>
                    <p style="margin: 5px 0; font-size: 18px;"><strong>Match:</strong> ${booking.assignedMatch}</p>
                  </div>
                  `
                    : `
                  <div style="background-color: #e3f2fd; border: 2px dashed #2196f3; border-radius: 12px; padding: 20px; text-align: center;">
                    <h3 style="margin: 0 0 10px; color: #1565c0;">🤫 The Surprise Awaits...</h3>
                    <p style="margin: 0; color: #555;">
                      Your exact destination and match tickets will be revealed <strong>48 hours before departure</strong>. Stay tuned!
                    </p>
                  </div>
                  `
                }
              </div>

              <!-- Extras Section -->
              ${
                booking.bookingExtras && booking.bookingExtras.length > 0
                  ? `
              <div style="${STYLES.section}">
                <h3 style="margin: 0 0 15px; color: #333; font-size: 18px;">✨ Selected Extras</h3>
                <table width="100%" cellpadding="10" cellspacing="0" style="background-color: #fafafa; border-radius: 8px;">
                  ${booking.bookingExtras
                    .filter((e) => e.isSelected)
                    .map(
                      (extra) => `
                    <tr>
                      <td style="border-bottom: 1px solid #eee;"><strong>${extra.name}</strong> (x${extra.quantity})</td>
                      <td align="right" style="border-bottom: 1px solid #eee;">${extra.price === 0 ? "Included" : `€${extra.price}`}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </table>
              </div>
              `
                  : ""
              }

              <!-- Footer -->
              <div style="${STYLES.footer}">
                <p style="margin: 0; color: #999; font-size: 12px;">
                  Need help? Contact us at <a href="mailto:${process.env.MAIL_TO || "support@gogame.com"}" style="color: #76C043;">${process.env.MAIL_TO || "support@gogame.com"}</a>
                </p>
                <p style="margin: 10px 0 0; color: #999; font-size: 12px;">
                  © ${new Date().getFullYear()} GoGame. All rights reserved.
                </p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, htmlContent };
}

export function generateAdminEmailContent(booking: BookingData) {
  const subject = `📢 New Booking! #${booking.id} - ${booking.fullName}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Booking Notification</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f2f5; color: #333;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
          <td align="center">
            <div style="${STYLES.container}">
              <!-- Admin Header -->
              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 30px; text-align: center;">
                <h1 style="${STYLES.headerTitle} font-size: 24px;">New Application Received</h1>
                <p style="color: #bbb; margin-top: 5px;">Action Required</p>
              </div>

              <!-- Main Info -->
              <div style="${STYLES.section}">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="60%">
                      <h2 style="margin: 0; color: #333;">${booking.fullName}</h2>
                      <p style="margin: 5px 0 0; color: #666;">${booking.email}</p>
                      <p style="margin: 2px 0 0; color: #666;">${booking.phone}</p>
                    </td>
                    <td width="40%" align="right">
                      <div style="background-color: #e8f5e9; color: #2e7d32; padding: 8px 16px; border-radius: 20px; font-weight: 600; display: inline-block;">
                        ${booking.payment_status?.toUpperCase() || "PAID"}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Detailed Stats -->
              <div style="padding: 0 30px 30px;">
                <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; color: #333;">📦 Booking Details</h3>
                
                <table width="100%" cellpadding="10" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; border: 1px solid #eee;">
                  <tr>
                    <td width="35%" style="color: #666;">Booking ID</td>
                    <td style="font-weight: 600;">#${booking.id}</td>
                  </tr>
                   <tr>
                    <td style="color: #666;">Package</td>
                    <td style="font-weight: 600;">${booking.selectedPackage}</td>
                  </tr>
                  <tr>
                    <td style="color: #666;">Sport & League</td>
                    <td style="font-weight: 600;">${booking.selectedSport} / ${booking.selectedLeague}</td>
                  </tr>
                  <tr>
                    <td style="color: #666;">Departure</td>
                    <td style="font-weight: 600;">${booking.selectedCity}</td>
                  </tr>
                  <tr>
                    <td style="color: #666;">Dates</td>
                    <td style="font-weight: 600;">${booking.departureDateFormatted} - ${booking.returnDateFormatted}</td>
                  </tr>
                  <tr>
                    <td style="color: #666;">Group Size</td>
                    <td style="font-weight: 600;">${booking.totalPeople} People (${booking.adults} Ad, ${booking.kids} Ch)</td>
                  </tr>
                   <tr>
                    <td style="color: #666;">Extras Cost</td>
                    <td style="font-weight: 600;">€${booking.totalExtrasCost}</td>
                  </tr>
                </table>

                <!-- Link to Admin Panel -->
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/bookings/${booking.id}" style="${STYLES.button}">
                    View Full Booking
                  </a>
                </div>
              </div>

               <!-- Traveler List Preview -->
               ${
                 booking.allTravelers && booking.allTravelers.length > 0
                   ? `
               <div style="${STYLES.section}; background-color: #fafafa;">
                 <h4 style="margin: 0 0 10px; color: #666;">👥 Traveler Manifest</h4>
                 <ul style="margin: 0; padding-left: 20px; color: #555;">
                   ${booking.allTravelers
                     .map(
                       (t) =>
                         `<li>${t.name} (${t.documentNumber || "No Doc"})</li>`,
                     )
                     .join("")}
                 </ul>
               </div>
               `
                   : ""
               }

              <!-- Footer -->
              <div style="${STYLES.footer}">
                <p style="margin: 0; color: #999; font-size: 12px;">Start preparing the surprise!</p>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, htmlContent };
}

export async function sendBookingConfirmationEmail(
  booking: BookingData,
  options?: { showReveal?: boolean },
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.error(
        "❌ Email configuration missing: MAIL_USER or MAIL_PASS not set",
      );
      return {
        success: false,
        message: "Email service not configured",
        error: "MAIL_USER or MAIL_PASS is missing",
      };
    }

    if (!booking || !booking.email) {
      console.error("❌ Missing booking data or email");
      return {
        success: false,
        message: "Booking data and email are required",
        error: "Missing booking or email",
      };
    }

    const userEmailContent = generateUserEmailContent(booking, options);

    await transporter.sendMail({
      from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
      to: booking.email,
      subject: userEmailContent.subject,
      html: userEmailContent.htmlContent,
      // Fallback text (simplified)
      text: `Booking Confirmed #${booking.id}. Thank you for booking with GoGame! Check your email for details.`,
      replyTo: process.env.MAIL_FROM ?? process.env.MAIL_USER,
    });

    // 2. Generate and Send Admin Email
    const adminEmail = process.env.MAIL_TO ?? process.env.MAIL_USER;
    if (adminEmail) {
      try {
        const adminEmailContent = generateAdminEmailContent(booking);

        await transporter.sendMail({
          from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
          to: adminEmail,
          subject: adminEmailContent.subject,
          html: adminEmailContent.htmlContent,
          text: `New Booking #${booking.id} from ${booking.fullName}`,
          replyTo: booking.email,
        });
      } catch (adminError) {
        console.error("❌ Failed to send admin email:", adminError);
        // We do not throw here to allow function to return success for user email
      }
    }

    return {
      success: true,
      message: "Confirmation emails sent successfully",
    };
  } catch (error) {
    console.error("❌ Error sending booking confirmation email:", error);

    const isTransient =
      error instanceof Error && emailQueue.isTransientError(error);

    if (isTransient) {
      try {
        // Queue retry for USER email only (Admin is secondary)
        const userContent = generateUserEmailContent(booking, options);
        await emailQueue.addToQueue({
          to: booking.email,
          subject: userContent.subject,
          html: userContent.htmlContent,
          text: `Booking Confirmed #${booking.id}`,
          from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
          replyTo: process.env.MAIL_FROM ?? process.env.MAIL_USER,
          bookingId: booking.id,
          type: "booking",
        });

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
  booking: BookingData,
  options?: { showReveal?: boolean; delay?: number },
) {

  // 1. Queue User Email
  const userContent = generateUserEmailContent(booking, options);
  await emailQueue.addToQueue(
    {
      to: booking.email,
      subject: userContent.subject,
      html: userContent.htmlContent,
      text: userContent.subject,
      from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
      type: "booking",
      bookingId: booking.id,
    },
    { delay: options?.delay },
  );

  // 2. Queue Admin Email (Immediate only)
  // Only send admin email if it's an immediate action (no excessive delay)
  // And avoid duplicate admin emails if this is a delayed job.
  if (!options?.delay) {
    const adminEmail = process.env.MAIL_TO ?? process.env.MAIL_USER;
    if (adminEmail) {
      const adminContent = generateAdminEmailContent(booking);
      await emailQueue.addToQueue({
        to: adminEmail,
        subject: adminContent.subject,
        html: adminContent.htmlContent,
        text: `New Booking #${booking.id}`,
        from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
        type: "booking",
        bookingId: booking.id,
        replyTo: booking.email,
      });
    }
  }
}
