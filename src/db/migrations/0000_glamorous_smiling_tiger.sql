CREATE TYPE "public"."role" AS ENUM('USER', 'PAID', 'ADMIN');--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" text PRIMARY KEY NOT NULL,
	"series_id" text NOT NULL,
	"title" text NOT NULL,
	"duration_sec" integer NOT NULL,
	"media_path" text NOT NULL,
	"order_index" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listen_progress" (
	"user_id" text NOT NULL,
	"episode_id" text NOT NULL,
	"position_sec" integer DEFAULT 0 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "listen_progress_user_id_episode_id_pk" PRIMARY KEY("user_id","episode_id")
);
--> statement-breakpoint
CREATE TABLE "paid_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"account_number" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"total_duration_sec" integer NOT NULL,
	"episodes_count" integer NOT NULL,
	"type_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"password_hash" text NOT NULL,
	"birth_date" timestamp,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listen_progress" ADD CONSTRAINT "listen_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listen_progress" ADD CONSTRAINT "listen_progress_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paid_profiles" ADD CONSTRAINT "paid_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_type_id_series_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."series_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "episodes_series_idx" ON "episodes" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "series_title_idx" ON "series" USING btree ("title");--> statement-breakpoint
CREATE INDEX "series_type_idx" ON "series" USING btree ("type_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_name_idx" ON "users" USING btree ("last_name","first_name");