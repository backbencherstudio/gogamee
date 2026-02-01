// Migration script to update Package schema from old to new structure
// Run this with: node backend/scripts/migratePackages.js

const mongoose = require("mongoose");
require("dotenv").config();

async function migratePackages() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/gogame";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const packagesCollection = db.collection("packages");

    // Get all existing packages
    const existingPackages = await packagesCollection.find({}).toArray();
    console.log(`📦 Found ${existingPackages.length} packages to migrate`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const pkg of existingPackages) {
      try {
        // Skip if already migrated (has 'included' field)
        if (pkg.included) {
          console.log(`⏭️  Skipping ${pkg._id} - already migrated`);
          skipped++;
          continue;
        }

        // Determine new fields from old ones
        const updateData = {};

        // Map category -> included
        if (pkg.category) {
          updateData.included = pkg.category;
          if (pkg.category_es) {
            updateData.included_es = pkg.category_es;
          }
        } else {
          updateData.included = "Package";
        }

        // Create description from standard or premium
        // If both exist, combine them; otherwise use whichever exists
        let description = pkg.standard || pkg.premium || "Package details";
        updateData.description = description;
        
        if (pkg.standard_es || pkg.premium_es) {
          updateData.description_es = pkg.standard_es || pkg.premium_es;
        }

        // Set plan - if it's "Starting Price", make it combined, otherwise standard
        if (pkg.category === "Starting Price") {
          updateData.plan = "combined";
        } else {
          // You can customize this logic based on your needs
          updateData.plan = "standard";
        }

        // Set duration - default to 1 night
        updateData.duration = 1;

        // Update the package
        await packagesCollection.updateOne(
          { _id: pkg._id },
          {
            $set: updateData,
            $unset: {
              category: "",
              category_es: "",
              standard: "",
              standard_es: "",
              premium: "",
              premium_es: "",
            },
          }
        );

        console.log(`✅ Migrated package ${pkg._id}: ${updateData.included}`);
        migrated++;
      } catch (error) {
        console.error(`❌ Error migrating package ${pkg._id}:`, error.message);
        errors++;
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📦 Total: ${existingPackages.length}`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

migratePackages();
