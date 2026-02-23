CREATE TABLE "automation_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text,
	"type" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"triggered_by" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"executed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "automation_actions" ADD CONSTRAINT "automation_actions_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;