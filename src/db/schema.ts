import {
  pgEnum,
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["USER", "PAID", "ADMIN"]);

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), 
    email: text("email").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    passwordHash: text("password_hash").notNull(), 
    birthDate: timestamp("birth_date", { mode: "date" }),
    role: roleEnum("role").notNull().default("USER"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    emailUq: uniqueIndex("users_email_uq").on(t.email), 
    nameIdx: index("users_name_idx").on(t.lastName, t.firstName), 
  })
);

export const paidProfiles = pgTable("paid_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }), 
  accountNumber: text("account_number").notNull(), 
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const seriesTypes = pgTable(
  "series_types",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
  },
  (t) => ({
    nameUq: uniqueIndex("series_types_name_uq").on(t.name),
  })
);

export const series = pgTable(
  "series",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    totalDurationSec: integer("total_duration_sec").notNull(),
    episodesCount: integer("episodes_count").notNull(),
    imageUrlSer: text("imageUrlSer").notNull(), 
    typeId: text("type_id")
      .notNull()
      .references(() => seriesTypes.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    titleIdx: index("series_title_idx").on(t.title), 
    typeIdx: index("series_type_idx").on(t.typeId),
  })
);

export const episodes = pgTable(
  "episodes",
  {
    id: text("id").primaryKey(),
    seriesId: text("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }), 
    title: text("title").notNull(),
    durationSec: integer("duration_sec").notNull(),
    imageUrlEp: text("imageUrlEp").notNull(), 
    mediaPath: text("media_path").notNull(), 
    orderIndex: integer("order_index"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    seriesIdx: index("episodes_series_idx").on(t.seriesId),
  })
);

export const listenProgress = pgTable(
  "listen_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    episodeId: text("episode_id")
      .notNull()
      .references(() => episodes.id, { onDelete: "cascade" }),
    positionSec: integer("position_sec").notNull().default(0), 
    completed: boolean("completed").notNull().default(false),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.episodeId] }),
  })
);
