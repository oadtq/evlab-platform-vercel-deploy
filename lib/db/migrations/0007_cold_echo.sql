CREATE TABLE IF NOT EXISTS "McpOAuth" (
	"userId" uuid NOT NULL,
	"provider" varchar(64) NOT NULL,
	"clientInformation" json,
	"tokens" json,
	"codeVerifier" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "McpOAuth_userId_provider_pk" PRIMARY KEY("userId","provider")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "McpOAuth" ADD CONSTRAINT "McpOAuth_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
