CREATE TYPE "public"."application_status" AS ENUM('not_started', 'in_progress', 'submitted', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."degree" AS ENUM('bachelor', 'master', 'mba', 'phd');--> statement-breakpoint
CREATE TYPE "public"."lock_status" AS ENUM('locked', 'unlocked');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'ai');--> statement-breakpoint
CREATE TYPE "public"."todo_creator" AS ENUM('ai', 'user');--> statement-breakpoint
CREATE TYPE "public"."todo_status" AS ENUM('pending', 'completed');--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"ai_session_id" varchar(36) NOT NULL,
	"role" "role" NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"onboarding_form_id" varchar(36) NOT NULL,
	"profile_summary" text,
	"is_profile_changed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"university_id" varchar(36) NOT NULL,
	"status" "application_status" DEFAULT 'not_started',
	"applied_at" timestamp,
	"decision_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"university_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"degree" "degree" NOT NULL,
	"duration" integer,
	"tuition_fee" integer
);
--> statement-breakpoint
CREATE TABLE "locked_universities" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"university_id" varchar(36) NOT NULL,
	"status" "lock_status" DEFAULT 'locked',
	"locked_at" timestamp DEFAULT now(),
	"unlocked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "onboarding_forms" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"academic" text NOT NULL,
	"goals" text NOT NULL,
	"budget" text NOT NULL,
	"exams" text NOT NULL,
	"is_complete" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"created_by" "todo_creator" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "todo_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"description" text,
	"grade" text,
	"rating" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"subscription" boolean DEFAULT false,
	"subscription_start_date" timestamp,
	"subscription_end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_ai_session_id_ai_sessions_id_fk" FOREIGN KEY ("ai_session_id") REFERENCES "public"."ai_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_sessions" ADD CONSTRAINT "ai_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_sessions" ADD CONSTRAINT "ai_sessions_onboarding_form_id_onboarding_forms_id_fk" FOREIGN KEY ("onboarding_form_id") REFERENCES "public"."onboarding_forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locked_universities" ADD CONSTRAINT "locked_universities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locked_universities" ADD CONSTRAINT "locked_universities_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_forms" ADD CONSTRAINT "onboarding_forms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;