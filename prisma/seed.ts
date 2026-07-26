/**
 * Seeds one Admin and one Member account for local dev / the graders,
 * plus a couple of sample leads so the pipeline isn't empty on first
 * login. Safe to re-run - it skips anything that already exists.
 *
 * Run with: pnpm db:seed
 */
import "dotenv/config";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ADMIN_EMAIL = "admin@digitalheroes.test";
const ADMIN_PASSWORD = "Admin1234!";
const MEMBER_EMAIL = "member@digitalheroes.test";
const MEMBER_PASSWORD = "Member1234!";

async function ensureUser(
  email: string,
  password: string,
  name: string,
  role: "ADMIN" | "MEMBER",
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`- ${email} already exists, skipping`);
    return existing;
  }

  const result = await auth.api.signUpEmail({
    body: { email, password, name },
  });

  const user = await prisma.user.update({
    where: { id: result.user.id },
    data: { role },
  });

  console.log(`- created ${role} account: ${email}`);
  return user;
}

async function main() {
  console.log("Seeding users...");
  await ensureUser(
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    "Alex Admin",
    "ADMIN",
  );
  const member = await ensureUser(
    MEMBER_EMAIL,
    MEMBER_PASSWORD,
    "Morgan Member",
    "MEMBER",
  );

  const existingLeads = await prisma.lead.count();
  if (existingLeads === 0) {
    console.log("Seeding sample leads...");
    await prisma.lead.create({
      data: {
        name: "Jamie Taylor",
        email: "jamie@example.com",
        company: "Acme Co",
        source: "WEBSITE",
        status: "NEW",
        budget: 5000,
        message: "Interested in the starter plan.",
      },
    });
    await prisma.lead.create({
      data: {
        name: "Riley Chen",
        email: "riley@example.com",
        company: "Northwind",
        source: "LINKEDIN",
        status: "CONTACTED",
        assignedToId: member.id,
        budget: 20000,
      },
    });
  } else {
    console.log("Leads already exist, skipping sample data");
  }

  console.log("\nDone. Credentials:");
  console.log(`  Admin  -> ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  Member -> ${MEMBER_EMAIL} / ${MEMBER_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
