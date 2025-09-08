DROP TABLE IF EXISTS "UserIntegrationEvent";--> statement-breakpoint
ALTER TABLE "UserIntegration" DROP CONSTRAINT IF EXISTS "UserIntegration_userId_User_id_fk";
--> statement-breakpoint
ALTER TABLE "UserIntegration" DROP CONSTRAINT IF EXISTS "UserIntegration_userId_integrationId_pk";--> statement-breakpoint
ALTER TABLE "UserIntegration" ALTER COLUMN "isConnected" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "UserIntegration" ALTER COLUMN "connectedAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "UserIntegration" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "UserIntegration" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_userId_integrationName_pk" PRIMARY KEY("userId","integrationName");--> statement-breakpoint
ALTER TABLE "UserIntegration" ADD COLUMN "connectionId" varchar(255);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserIntegration" ADD CONSTRAINT "UserIntegration_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "UserIntegration" DROP COLUMN IF EXISTS "integrationId";--> statement-breakpoint
ALTER TABLE "UserIntegration" DROP COLUMN IF EXISTS "composioConnectionId";--> statement-breakpoint
ALTER TABLE "UserIntegration" DROP COLUMN IF EXISTS "lastVerifiedAt";