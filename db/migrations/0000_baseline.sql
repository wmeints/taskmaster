CREATE TABLE "list_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"list_id" uuid NOT NULL,
	"email" text NOT NULL,
	"invited_by" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"declined_at" timestamp with time zone,
	CONSTRAINT "list_invites_list_id_email_key" UNIQUE("list_id","email")
);
--> statement-breakpoint
CREATE TABLE "list_members" (
	"list_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "list_members_pkey" PRIMARY KEY("list_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subtasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"title" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"list_id" uuid,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"due_date" date,
	"due_time" time,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "list_invites" ADD CONSTRAINT "list_invites_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "list_members" ADD CONSTRAINT "list_members_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "list_invites_email_idx" ON "list_invites" USING btree ("email");--> statement-breakpoint
CREATE INDEX "list_members_user_id_idx" ON "list_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lists_user_id_idx" ON "lists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subtasks_task_id_idx" ON "subtasks" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "tasks_user_id_completed_at_idx" ON "tasks" USING btree ("user_id","completed_at");--> statement-breakpoint
CREATE INDEX "tasks_list_id_idx" ON "tasks" USING btree ("list_id");