import { PrismaClient, Role, CategoryType } from "../prisma/generated/prisma";
import { CATEGORY_TEMPLATES } from "../src/lib/category-templates";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding MaintXperts database (Clerk Admin Only)...");

  // --- ADMIN USER (YOUR CLERK ACCOUNT) ---
  // Replace the email below with your real Clerk admin email
  const adminUser = await prisma.user.create({
    data: {
      firstName: "Sowrish",
      lastName: "Sai",
      email: "sowrish.10@icloud.com", // 👈 your actual Clerk email
      password: "#Apple10ten",    // placeholder — Clerk manages auth
      role: Role.ADMINISTRATOR,
      isActive: true,
    },
  });

  console.log("✅ Admin user created:", adminUser.email);

  // --- BUILDINGS ---
  const buildings = await Promise.all([
    prisma.building.create({ data: { name: "Admin Building" } }),
    prisma.building.create({ data: { name: "Wells Hall" } }),
    prisma.building.create({ data: { name: "Colden Hall" } }),
  ]);

  console.log("🏢 Buildings created");

  // --- DATA CATEGORIES ---
  // Attach category templates to each building
  for (const building of buildings) {
    for (const template of CATEGORY_TEMPLATES) {
      await prisma.dataCategory.create({
        data: {
          name: template.name,
          type: template.type as CategoryType,
          buildingId: building.id,
        },
      });
    }
  }

  console.log(`📊 ${CATEGORY_TEMPLATES.length * buildings.length} categories created`);

  // --- SAMPLE INSPECTION (by Admin) ---
  const inspection = await prisma.inspection.create({
    data: {
      date: new Date(),
      notes: "Initial campus inspection by admin.",
      technicianId: adminUser.id, // 👈 use the admin as the inspector
      buildingId: buildings[0].id, // First building
    },
  });

  // --- SAMPLE READINGS ---
  const categories = await prisma.dataCategory.findMany({
    where: { buildingId: buildings[0].id },
  });

  for (const c of categories) {
    await prisma.reading.create({
      data: {
        inspectionId: inspection.id,
        categoryId: c.id,
        numericalValue: c.type === "NUMBER" ? 65 + Math.random() * 10 : null,
        booleanValue: c.type === "ON_OFF" ? Math.random() > 0.5 : null,
      },
    });
  }

  console.log("📈 Sample inspection + readings created");
  console.log("✅ Seeding completed successfully!");
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seeding failed", e);
    await prisma.$disconnect();
    process.exit(1);
  });
