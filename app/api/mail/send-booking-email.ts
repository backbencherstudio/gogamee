// Shared email sending function that can be imported directly
import { emailQueue } from "@/backend/lib/email-queue";
import { transporter } from "@/backend/lib/mail-transport";
import { IBooking } from "@/backend/models/Booking.model";

// Basic interface for Booking Data
export interface BookingData {
  id?: string;
  _id?: string;
  fullName?: string; // or travelers.primaryContact.name
  travelers?: {
    primaryContact?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    totalCount?: number;
  };
  selection?: {
    sport?: string;
    city?: string;
    package?: string;
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
    // other fields
  };
  // Legacy or flat fields that might be present
  totalExtrasCost?: number;
  bookingExtras?: any[];
  dates?: {
    departure?: string;
    return?: string;
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
  const bookingId = bookingData._id?.toString() || bookingData.id;
  const fullName =
    bookingData.travelers?.primaryContact?.name ||
    bookingData.fullName ||
    "Guest";
  const email = bookingData.travelers?.primaryContact?.email || "";
  const destinationCity = bookingData.destinationCity;
  const assignedMatch = bookingData.assignedMatch;
  const selectedPackage =
    bookingData.selection?.package || bookingData.selectedPackage;
  const selectedCity = bookingData.selection?.city || bookingData.selectedCity;
  const selectedSport = bookingData.selection?.sport;
  const departureDateFormatted =
    bookingData.departureDateFormatted ||
    formatDate(bookingData.dates?.departure);
  const returnDateFormatted =
    bookingData.returnDateFormatted || formatDate(bookingData.dates?.return);
  const totalPeople =
    bookingData.travelers?.totalCount || bookingData.totalPeople || 0;
  const selectedExtras: any[] =
    bookingData.extras?.selected || bookingData.bookingExtras || [];

  const subject =
    showReveal && destinationCity
      ? `Your Trip Revealed! #${bookingId}`
      : `Booking Confirmed! #${bookingId}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="${STYLES.container}">
        <!-- Header -->
        <div style="${STYLES.header}">
          <h1 style="${STYLES.headerTitle}">
            ${showReveal && destinationCity ? "Your Destination Revealed!" : "Booking Confirmed!"}
          </h1>
        </div>

        <!-- Greeting -->
        <div style="${STYLES.section}">
          <h2 style="margin: 0 0 10px; color: #333;">Hello ${fullName},</h2>
          <p style="margin: 0; color: #555;">
            ${
              showReveal && destinationCity
                ? "Your surprise destination is ready!"
                : "Thank you for booking with GoGame!"
            }
          </p>
        </div>

        <!-- Booking Details -->
        <div style="${STYLES.section}">
          <h3 style="margin: 0 0 15px; color: #6AAD3C;">Booking Details</h3>
          <table width="100%" cellpadding="8" cellspacing="0">
            <tr>
              <td style="${STYLES.label}">Booking ID</td>
              <td style="${STYLES.value}">#${bookingId}</td>
            </tr>
            <tr>
              <td style="${STYLES.label}">Package</td>
              <td style="${STYLES.value}">${selectedPackage || "N/A"}</td>
            </tr>
            <tr>
              <td style="${STYLES.label}">Sport</td>
              <td style="${STYLES.value}">${selectedSport || "N/A"}</td>
            </tr>
            <tr>
              <td style="${STYLES.label}">Departure City</td>
              <td style="${STYLES.value}">${selectedCity || "N/A"}</td>
            </tr>
            <tr>
              <td style="${STYLES.label}">Travel Dates</td>
              <td style="${STYLES.value}">${departureDateFormatted} - ${returnDateFormatted}</td>
            </tr>
            <tr>
              <td style="${STYLES.label}">Travelers</td>
              <td style="${STYLES.value}">${totalPeople} Person(s)</td>
            </tr>
          </table>
        </div>

        <!-- Destination Section -->
        ${
          showReveal && destinationCity && assignedMatch
            ? `
        <div style="${STYLES.section}; background-color: #fff8e1;">
          <h3 style="margin: 0 0 10px; color: #f57f17;">🎯 Your Surprise!</h3>
          <p style="margin: 5px 0;"><strong>Destination:</strong> ${destinationCity}</p>
          <p style="margin: 5px 0;"><strong>Match:</strong> ${assignedMatch}</p>
        </div>
        `
            : `
        <div style="${STYLES.section}; background-color: #e3f2fd;">
          <h3 style="margin: 0 0 10px; color: #1565c0;">🤫 Surprise Coming Soon</h3>
          <p style="margin: 0; color: #555;">
            Your destination will be revealed <strong>48 hours before departure</strong>.
          </p>
        </div>
        `
        }

        <!-- Payment Summary Section -->
               <div style="${STYLES.section}">
                <h3 style="margin: 0 0 15px; color: #333; font-size: 18px;">💳 Payment Summary</h3>
                <table width="100%" cellpadding="8" cellspacing="0" style="background-color: #fafafa; border-radius: 8px; border: 1px solid #eee;">
                  
                  <!-- Breakdown Items -->
                  ${
                    bookingData.priceBreakdown?.items
                      ? bookingData.priceBreakdown.items
                          .map(
                            (item) => `
                        <tr>
                          <td style="border-bottom: 1px solid #eee; color: #555;">${item.description} ${(item.quantity || 0) > 1 ? `(x${item.quantity})` : ""}</td>
                          <td align="right" style="border-bottom: 1px solid #eee; font-weight: 500;">€${item.amount.toFixed(2)}</td>
                        </tr>
                      `,
                          )
                          .join("")
                      : `
                        <tr>
                          <td style="border-bottom: 1px solid #eee; color: #555;">Package Base Cost</td>
                          <td align="right" style="border-bottom: 1px solid #eee; font-weight: 500;">€${(bookingData.priceBreakdown?.packageCost || 0).toFixed(2)}</td>
                        </tr>
                        ${
                          (bookingData.extras?.totalCost ||
                            bookingData.totalExtrasCost ||
                            0) > 0
                            ? `
                        <tr>
                          <td style="border-bottom: 1px solid #eee; color: #555;">Extras</td>
                          <td align="right" style="border-bottom: 1px solid #eee; font-weight: 500;">€${(bookingData.extras?.totalCost || bookingData.totalExtrasCost || 0).toFixed(2)}</td>
                        </tr>
                        `
                            : ""
                        }
                      `
                  }

                  <!-- Spacer -->
                  <tr><td colspan="2" style="height: 10px;"></td></tr>

                  <!-- Totals -->
                  <tr style="background-color: #f0f0f0;">
                    <td style="border-top: 2px solid #ddd; font-weight: 700; color: #333;">Total Cost</td>
                    <td align="right" style="border-top: 2px solid #ddd; font-weight: 700; color: #333;">€${(bookingData.totalCost || 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="color: #4a9e2a; font-weight: 600;">Amount Paid</td>
                    <td align="right" style="color: #4a9e2a; font-weight: 600;">€${(bookingData
                      .payment?.status === "paid" ||
                    bookingData.payment_status === "paid"
                      ? bookingData.totalCost || 0
                      : 0
                    ).toFixed(2)}</td>
                  </tr>
                   <tr>
                    <td style="border-top: 1px solid #eee; color: #d32f2f; font-weight: 600;">Balance Due</td>
                    <td align="right" style="border-top: 1px solid #eee; color: #d32f2f; font-weight: 600;">€${(
                      (bookingData.totalCost || 0) -
                      (bookingData.payment?.status === "paid" ||
                      bookingData.payment_status === "paid"
                        ? bookingData.totalCost || 0
                        : 0)
                    ).toFixed(2)}</td>
                  </tr>
                </table>
              </div>

              <!-- Extras Detail List (Optional) -->
              ${
                selectedExtras.length > 0
                  ? `
              <div style="${STYLES.section}">
                <h3 style="margin: 0 0 15px; color: #333; font-size: 18px;">✨ Selected Extras Details</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555;">
                  ${selectedExtras
                    .filter((e: any) => e.isSelected)
                    .map(
                      (extra: any) => `
                    <li style="margin-bottom: 5px;">
                      <strong>${extra.name}</strong> 
                      ${extra.quantity && extra.quantity > 1 ? `(x${extra.quantity})` : ""}
                      - ${extra.price === 0 ? "Included" : `€${extra.price}`}
                    </li>
                  `,
                    )
                    .join("")}
                </ul>
              </div>
              `
                  : ""
              }

        <!-- Footer -->
        <div style="${STYLES.footer}">
          <p style="margin: 0; color: #999; font-size: 12px;">
            Need help? Contact us at ${process.env.MAIL_TO || "support@gogame.com"}
          </p>
          <p style="margin: 10px 0 0; color: #999; font-size: 12px;">
            © ${new Date().getFullYear()} GoGame. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, htmlContent };
}

export function generateAdminEmailContent(booking: IBooking) {
  const bookingId = booking._id?.toString();
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
      text: `Booking Confirmed #${booking._id}`,
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
          text: `New Booking #${booking._id}`,
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
            text: `Booking Confirmed #${booking._id}`,
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
        text: `New Booking #${booking._id}`,
        from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
        type: "booking",
        bookingId: booking._id?.toString() || "",
        replyTo: email,
      });
    }
  }
}
