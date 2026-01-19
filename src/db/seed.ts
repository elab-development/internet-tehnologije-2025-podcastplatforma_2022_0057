import { db } from "./index";
import * as schema from "./schema";
import bcrypt from "bcrypt";
import "dotenv/config";
console.log("DATABASE_URL =", process.env.DATABASE_URL);

async function main() {
  console.log("Baza podataka...");

 /*
  await db.delete(schema.listenProgress);
  await db.delete(schema.episodes);
  await db.delete(schema.series);
  await db.delete(schema.seriesTypes);
  await db.delete(schema.paidProfiles);
  await db.delete(schema.users);*/

  const hashedPw = await bcrypt.hash("lozinka123", 10);

 
  console.log("Kreiranje admina...");
  await db.insert(schema.users).values({
    id: "admin_03",
    email: "admin3@podcast.rs",
    firstName: "Glavni",
    lastName: "Administrator",
    passwordHash: hashedPw,
    role: "ADMIN",
  });

  
  const user1Id = "user_3";
  const user2Id = "user_paid3";

  await db.insert(schema.users).values([
    {
      id: user1Id,
      email: "petar3@gmail.com",
      firstName: "Petar",
      lastName: "Petrović",
      passwordHash: hashedPw,
      role: "USER",
    },
    {
      id: user2Id,
      email: "marko3@gmail.com",
      firstName: "Marko",
      lastName: "Marković",
      passwordHash: hashedPw,
      role: "PAID",
    }
  ]);


  await db.insert(schema.paidProfiles).values({
    userId: user2Id,
    accountNumber: "160-0000000001234-56",
  });

  
  const typeId = "type_edu3";
  await db.insert(schema.seriesTypes).values({ id: typeId, name: "Edukacija3" });

  const seriesId = "series_03";
  await db.insert(schema.series).values({
    id: seriesId,
    title: "IT Razgovori",
    description: "Podcast o modernim tehnologijama",
    typeId: typeId,
    episodesCount: 1,
    totalDurationSec: 600,
  });

  const epId = "ep_03";
  await db.insert(schema.episodes).values({
    id: epId,
    seriesId: seriesId,
    title: "Uvod u Docker",
    durationSec: 600,
    mediaPath: "/storage/ep1.mp3",
  });

  
  await db.insert(schema.listenProgress).values({
    userId: user2Id,
    episodeId: epId,
    positionSec: 120, 
  });

  console.log("Gotovo");
  process.exit(0);
}

main().catch(console.error);