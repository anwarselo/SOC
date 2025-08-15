CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"phone" text,
	"city" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"callback_date" date,
	"result" text,
	"comments" text,
	"assigned_to" text
);
--> statement-breakpoint
CREATE TABLE "support_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"role" text,
	"city" text,
	"page" text NOT NULL,
	"message" text NOT NULL,
	"stack" text,
	"screenshot_path" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"city" text NOT NULL,
	"salesperson_number" text,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_salesperson_number_unique" UNIQUE("salesperson_number")
);
