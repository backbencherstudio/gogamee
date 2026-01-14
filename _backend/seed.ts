import { connectToDatabase } from "./index";
import { AuthService } from "./modules/auth";

async function seed() {
  console.log("🌱 Starting database seed...");

  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    await connectToDatabase();
    console.log("✅ Connected to MongoDB");

    // Seed Super Admin
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || "admin123";
    const adminUsername = process.env.SUPER_ADMIN_USERNAME || "superadmin";

    if (!adminEmail) {
      console.warn("⚠️ SUPER_ADMIN_EMAIL not set. Skipping admin creation.");
    } else {
      const { User } = require("./models"); // Direct model access for check
      const exists = await User.findOne({
        $or: [{ email: adminEmail }, { username: adminUsername }],
      });

      if (exists) {
        console.log("ℹ️ Super Admin already exists. Skipping.");
      } else {
        console.log("Creating Super Admin...");
        await AuthService.create({
          username: adminUsername,
          email: adminEmail,
          password: adminPassword,
          role: "super_admin",
          profile: {
            firstName: "Super",
            lastName: "Admin",
          },
          permissions: ["*"], // Super admin gets all
        });
        console.log(`✅ Super Admin created: ${adminEmail} / ${adminPassword}`);
      }
    }

    console.log("🌱 Database seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
