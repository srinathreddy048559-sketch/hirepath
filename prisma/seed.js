import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Example job entries (optional)
  await prisma.job.createMany({
    data: [
      {
        title: "Sample AI Engineer Job",
        company: "HirePath",
        location: "Remote",
        employment: "Full-time",
        description: "Sample job description",
        requirements: "LLMs, RAG, GenAI",
      }
    ]
  });

  console.log("🌱 Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
