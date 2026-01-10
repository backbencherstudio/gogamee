// Shared email sending function that can be imported directly
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

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
  [key: string]: any; // Allow additional fields from Booking type
}

function generateEmailContent(booking: BookingData) {
  const subject = `🎉 GoGame Booking Confirmation - #${booking.id}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>GoGame Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #76C043 0%, #4a9e2a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .highlight { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .status-confirmed { color: #4caf50; font-weight: bold; }
        .status-pending { color: #ff9800; font-weight: bold; }
        .status-cancelled { color: #f44336; font-weight: bold; }
        h2 { color: #333; margin-top: 0; }
        h3 { color: #555; border-bottom: 2px solid #76C043; padding-bottom: 10px; }
        ul { margin: 10px 0; padding-left: 20px; }
        li { margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 GoGame Adventure Confirmed!</h1>
          <p>Your surprise sports journey is ready to begin</p>
        </div>
        
        <div class="content">
          <h2>Hello ${booking.fullName}!</h2>
          <p>Thank you for choosing GoGame for your sports adventure! Your booking has been confirmed and we're excited to create an unforgettable experience for you.</p>
          
          <div class="booking-details">
            <h3>📋 Booking Summary</h3>
            <p><strong>Booking ID:</strong> #${booking.id}</p>
            <p><strong>Status:</strong> <span class="status-${booking.status}">${
    booking.status === "completed"
      ? "✅ Confirmed"
      : booking.status === "pending"
      ? "⏳ Pending"
      : "❌ Cancelled"
  }</span></p>
            <p><strong>Payment Status:</strong> <span class="status-${
              booking.payment_status === "paid" ? "confirmed" : "pending"
            }">${
    booking.payment_status === "paid" ? "✅ Paid" : "⏳ Pending"
  }</span></p>
            <p><strong>Sport:</strong> ${booking.selectedSport}</p>
            <p><strong>Package:</strong> ${booking.selectedPackage}</p>
            <p><strong>Departure City:</strong> ${booking.selectedCity}</p>
            <p><strong>League:</strong> ${booking.selectedLeague}</p>
            <p><strong>Travel Dates:</strong> ${booking.departureDateFormatted} - ${booking.returnDateFormatted}</p>
            <p><strong>Total Travelers:</strong> ${booking.totalPeople} (${
    booking.adults
  } adults, ${booking.kids} kids, ${booking.babies} babies)</p>
            ${
              booking.allTravelers && booking.allTravelers.length > 0
                ? `
              <div style="margin-top: 15px;">
                <h4>Traveler Details:</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  ${booking.allTravelers
                    .map(
                      (traveler, index) => `
                    <li style="margin-bottom: 8px;">
                      <strong>Traveler ${index + 1}:</strong> ${traveler.name || "N/A"}<br>
                      <span style="color: #666; font-size: 14px;">
                        ${traveler.isPrimary ? "Primary Contact" : "Additional Traveler"} | 
                        ${traveler.dateOfBirth ? `DOB: ${traveler.dateOfBirth}` : ""} | 
                        ${traveler.documentType || "N/A"}: ${traveler.documentNumber || "N/A"}
                        ${
                          traveler.isPrimary
                            ? `<br>Email: ${traveler.email || "N/A"} | Phone: ${traveler.phone || "N/A"}`
                            : ""
                        }
                      </span>
                    </li>
                  `
                    )
                    .join("")}
                </ul>
              </div>
            `
                : ""
            }
          </div>
          
          ${
            booking.destinationCity && booking.assignedMatch
              ? `
            <div class="highlight">
              <h3>🎯 Your Surprise Destination & Match</h3>
              <p><strong>Destination City:</strong> ${booking.destinationCity}</p>
              <p><strong>Match:</strong> ${booking.assignedMatch}</p>
              <p><em>Get ready for an incredible experience!</em></p>
            </div>
          `
              : `
            <div class="highlight">
              <h3>🎯 Your Surprise Awaits!</h3>
              <p>Your destination and match details will be revealed 48 hours before departure. We're working hard to create the perfect surprise for you!</p>
            </div>
          `
          }
          
          ${
            booking.bookingExtras && booking.bookingExtras.length > 0
              ? `
            <div class="booking-details">
              <h3>🎁 Selected Extras</h3>
              <ul>
                ${booking.bookingExtras
                  .filter((extra) => extra.isSelected)
                  .map(
                    (extra) =>
                      `<li>${extra.name} (Qty: ${extra.quantity}) - ${
                        extra.price === 0 ? "Included" : extra.price + "€"
                      }</li>`
                  )
                  .join("")}
              </ul>
              <p><strong>Total Extras Cost:</strong> ${booking.totalExtrasCost}€</p>
            </div>
          `
              : ""
          }
          
          <div class="booking-details">
            <h3>📞 Contact Information</h3>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Phone:</strong> ${booking.phone}</p>
            ${booking.paymentMethod ? `<p><strong>Payment Method:</strong> ${booking.paymentMethod}</p>` : ""}
          </div>
          
          <div class="highlight">
            <h3>📅 Important Information</h3>
            <ul>
              <li>Please ensure you have valid travel documents (passport/ID)</li>
              <li>Check-in details will be provided closer to departure</li>
              <li>For any questions, contact our support team</li>
              <li>Travel insurance is recommended for all trips</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing GoGame!</p>
            <p>© 2024 GoGame. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    GoGame Adventure Confirmation - Booking #${booking.id}
    
    Hello ${booking.fullName}!
    
    Thank you for choosing GoGame for your sports adventure! Your booking has been confirmed.
    
    BOOKING SUMMARY:
    - Booking ID: #${booking.id}
    - Status: ${
      booking.status === "completed"
        ? "Confirmed"
        : booking.status === "pending"
        ? "Pending"
        : "Cancelled"
    }
    - Payment Status: ${booking.payment_status === "paid" ? "Paid" : "Pending"}
    - Sport: ${booking.selectedSport}
    - Package: ${booking.selectedPackage}
    - Departure City: ${booking.selectedCity}
    - League: ${booking.selectedLeague}
    - Travel Dates: ${booking.departureDateFormatted} - ${booking.returnDateFormatted}
    - Total Travelers: ${booking.totalPeople}
    
    ${
      booking.destinationCity && booking.assignedMatch
        ? `
    YOUR SURPRISE DESTINATION & MATCH:
    - Destination City: ${booking.destinationCity}
    - Match: ${booking.assignedMatch}
    `
        : `
    YOUR SURPRISE AWAITS:
    Your destination and match details will be revealed 48 hours before departure.
    `
    }
    
    CONTACT INFORMATION:
    - Email: ${booking.email}
    - Phone: ${booking.phone}
    
    IMPORTANT INFORMATION:
    - Please ensure you have valid travel documents
    - Check-in details will be provided closer to departure
    - For any questions, contact our support team
    - Travel insurance is recommended
    
    Thank you for choosing GoGame!
    © 2024 GoGame. All rights reserved.
  `;

  return { subject, htmlContent, textContent };
}

export async function sendBookingConfirmationEmail(booking: BookingData): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Check if email configuration is available
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.error("❌ Email configuration missing: MAIL_USER or MAIL_PASS not set");
      return {
        success: false,
        message: "Email service not configured",
        error: "MAIL_USER or MAIL_PASS is missing"
      };
    }

    if (!booking || !booking.email) {
      console.error("❌ Missing booking data or email");
      return {
        success: false,
        message: "Booking data and email are required",
        error: "Missing booking or email"
      };
    }

    console.log("📧 Processing email for booking:", booking.id);
    console.log("📧 Customer email:", booking.email);

    // Generate email content
    const emailContent = generateEmailContent(booking);

    // Send email to customer
    const customerEmailResult = await transporter.sendMail({
      from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
      to: booking.email,
      subject: emailContent.subject,
      html: emailContent.htmlContent,
      text: emailContent.textContent,
      replyTo: process.env.MAIL_FROM ?? process.env.MAIL_USER,
    });

    console.log("✅ Booking confirmation email sent to customer:", booking.email);
    console.log("📧 Email message ID:", customerEmailResult.messageId);

    // Also send notification email to admin
    const adminEmail = process.env.MAIL_TO ?? process.env.MAIL_USER;
    if (adminEmail && adminEmail !== booking.email) {
      try {
        const adminEmailContent = `
          <h2>New Booking Received</h2>
          <p><strong>Booking ID:</strong> ${booking.id}</p>
          <p><strong>Customer:</strong> ${booking.fullName}</p>
          <p><strong>Email:</strong> ${booking.email}</p>
          <p><strong>Phone:</strong> ${booking.phone}</p>
          <p><strong>Sport:</strong> ${booking.selectedSport}</p>
          <p><strong>Package:</strong> ${booking.selectedPackage}</p>
          <p><strong>City:</strong> ${booking.selectedCity}</p>
          <p><strong>League:</strong> ${booking.selectedLeague}</p>
          <p><strong>Travel Dates:</strong> ${booking.departureDateFormatted} - ${booking.returnDateFormatted}</p>
          <p><strong>Total People:</strong> ${booking.totalPeople}</p>
          <p><strong>Status:</strong> ${booking.status}</p>
          <p><strong>Payment Status:</strong> ${booking.payment_status}</p>
        `;

        await transporter.sendMail({
          from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
          to: adminEmail,
          subject: `New Booking: ${booking.id} - ${booking.fullName}`,
          html: adminEmailContent,
          text: `New Booking Received\n\nBooking ID: ${booking.id}\nCustomer: ${booking.fullName}\nEmail: ${booking.email}\nPhone: ${booking.phone}\nSport: ${booking.selectedSport}\nPackage: ${booking.selectedPackage}\nCity: ${booking.selectedCity}\nLeague: ${booking.selectedLeague}\nTravel Dates: ${booking.departureDateFormatted} - ${booking.returnDateFormatted}\nTotal People: ${booking.totalPeople}\nStatus: ${booking.status}\nPayment Status: ${booking.payment_status}`,
          replyTo: booking.email,
        });

        console.log("✅ Admin notification email sent to:", adminEmail);
      } catch (adminEmailError) {
        console.error("❌ Failed to send admin notification email:", adminEmailError);
        // Don't fail if admin email fails
      }
    }

    return {
      success: true,
      message: "Confirmation email sent successfully",
    };
  } catch (error) {
    console.error("❌ Error sending booking confirmation email:", error);
    return {
      success: false,
      message: "Failed to send email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

