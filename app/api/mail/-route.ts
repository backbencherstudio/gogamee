// import { NextRequest, NextResponse } from "next/server"
// import nodemailer from "nodemailer"

// const transporter = nodemailer.createTransport({
//   host: process.env.MAIL_HOST,
//   port: Number(process.env.MAIL_PORT || 587),
//   secure: process.env.MAIL_SECURE === "true",
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// })

// export async function POST(request: NextRequest) {
//   try {
//     const { name, email, message } = await request.json()

//     if (!name || !email || !message) {
//       return NextResponse.json(
//         { success: false, error: "All fields are required." },
//         { status: 400 }
//       )
//     }

//     await transporter.sendMail({
//       from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
//       to: process.env.MAIL_TO ?? process.env.MAIL_USER,
//       subject: `GoGame contact form: ${name}`,
//       replyTo: email,
//       text: `
// Name: ${name}
// Email: ${email}

// Message:
// ${message}
//       `.trim(),
//     })

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error("Mail send error:", error)
//     return NextResponse.json(
//       { success: false, error: "Unable to send message right now." },
//       { status: 500 }
//     )
//   }
// }
