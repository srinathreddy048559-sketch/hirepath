// prisma/seed.js
/* eslint-disable no-console */

// Import Prisma client from the generated output path
const { PrismaClient } = require('../app/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.tailoredRun.createMany({
    data: [
      {
        resume:
          "Srinath — AI/ML Engineer, experience in GenAI, LangChain, RAG, and LLM pipelines.",
        jd:
          "Company seeks Generative AI Engineer with Python, RAG, and LangChain expertise.",
        summary:
          "• Built a retrieval-augmented generation pipeline\n• Fine-tuned LLMs for QA\n• Deployed GenAI features on AWS\n• Strong Python + vector DBs",
        message:
          "Hi Recruiter, I’m excited about this GenAI Engineer role! I’ve built RAG systems and deployed LLM features in prod. Would love to share more.",
      },
      {
        resume:
          "John Doe — Data Scientist experienced in ML, LLMs, and vector search.",
        jd:
          "Hiring for LLM Engineer — need skills in OpenAI APIs, embeddings, and vector DBs.",
        summary:
          "• Created AI agents using OpenAI APIs\n• Implemented vector search with pgvector\n• Built LangChain pipelines\n• Led LLM deployments",
        message:
          "Hello, I’ve led LLM deployments with vector search integrations and would love to discuss the role.",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
