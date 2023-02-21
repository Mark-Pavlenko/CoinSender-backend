import { MigrationInterface, QueryRunner } from "typeorm";

export class addedNewRelations1674150553546 implements MigrationInterface {
    name = 'addedNewRelations1674150553546'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "roles_id"`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "isArchived" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "createDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "lastChangedDateTime" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "organization" ADD CONSTRAINT "UQ_1437a6c4896867bc247b7d297d7" UNIQUE ("wallet_id")`);
        await queryRunner.query(`ALTER TABLE "organization" ADD CONSTRAINT "UQ_ed1251fa3856cd1a6c98d7bcaa3" UNIQUE ("organization_id")`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "UQ_ccc7c1489f3a6b3c9b47d4537c5" UNIQUE ("role")`);
        await queryRunner.query(`ALTER TABLE "administrators" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."administrators_role_enum"`);
        await queryRunner.query(`ALTER TABLE "administrators" ADD "role" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "administrators" ALTER COLUMN "organization_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "organization_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "client" ALTER COLUMN "organization_id" DROP NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f5ae9cc5f32997cf18e58bc0c8"`);
        await queryRunner.query(`ALTER TABLE "employee" ALTER COLUMN "organization_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "organization_id" DROP NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f5ae9cc5f32997cf18e58bc0c8" ON "employee" ("wallet_id", "organization_id") `);
        await queryRunner.query(`ALTER TABLE "administrators" ADD CONSTRAINT "FK_5497ef9854e9e86bed5f9cc35b7" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "administrators" ADD CONSTRAINT "FK_adc7cd0deaa3687d9c9321a9990" FOREIGN KEY ("role") REFERENCES "roles"("role") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_7e7dc1f4fdd160b9af7e9fed580" FOREIGN KEY ("email_client") REFERENCES "client"("email") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_d4e095bcd100de447d3c27708f9" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client" ADD CONSTRAINT "FK_017eff9869b6f6a190052c4dba4" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employee" ADD CONSTRAINT "FK_b5b0a5f2ddc7062bbdded584a14" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "general_wallet" ADD CONSTRAINT "FK_d53cf79bcce8bc914f3a0541104" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "general_wallet" ADD CONSTRAINT "FK_ef9441cf63a8e96e98edf7baeef" FOREIGN KEY ("administrator_id") REFERENCES "administrators"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_6bfa4de53dd8a075ff6e3bd8a0a" FOREIGN KEY ("organization_wallet_id") REFERENCES "organization"("wallet_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transfers" ADD CONSTRAINT "FK_b27be3d106ab68eba7471e4b4df" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_c2381986fc93338fe1423445367" FOREIGN KEY ("organization_id") REFERENCES "organization"("organization_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet" ADD CONSTRAINT "FK_395daa16b4a2b70411db8ebd4a4" FOREIGN KEY ("administrator_id") REFERENCES "administrators"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_395daa16b4a2b70411db8ebd4a4"`);
        await queryRunner.query(`ALTER TABLE "wallet" DROP CONSTRAINT "FK_c2381986fc93338fe1423445367"`);
        await queryRunner.query(`ALTER TABLE "transfers" DROP CONSTRAINT "FK_b27be3d106ab68eba7471e4b4df"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_6bfa4de53dd8a075ff6e3bd8a0a"`);
        await queryRunner.query(`ALTER TABLE "general_wallet" DROP CONSTRAINT "FK_ef9441cf63a8e96e98edf7baeef"`);
        await queryRunner.query(`ALTER TABLE "general_wallet" DROP CONSTRAINT "FK_d53cf79bcce8bc914f3a0541104"`);
        await queryRunner.query(`ALTER TABLE "employee" DROP CONSTRAINT "FK_b5b0a5f2ddc7062bbdded584a14"`);
        await queryRunner.query(`ALTER TABLE "client" DROP CONSTRAINT "FK_017eff9869b6f6a190052c4dba4"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_d4e095bcd100de447d3c27708f9"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_7e7dc1f4fdd160b9af7e9fed580"`);
        await queryRunner.query(`ALTER TABLE "administrators" DROP CONSTRAINT "FK_adc7cd0deaa3687d9c9321a9990"`);
        await queryRunner.query(`ALTER TABLE "administrators" DROP CONSTRAINT "FK_5497ef9854e9e86bed5f9cc35b7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f5ae9cc5f32997cf18e58bc0c8"`);
        await queryRunner.query(`ALTER TABLE "transfers" ALTER COLUMN "organization_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "employee" ALTER COLUMN "organization_id" SET NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_f5ae9cc5f32997cf18e58bc0c8" ON "employee" ("wallet_id", "organization_id") `);
        await queryRunner.query(`ALTER TABLE "client" ALTER COLUMN "organization_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "organization_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "administrators" ALTER COLUMN "organization_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "administrators" DROP COLUMN "role"`);
        await queryRunner.query(`CREATE TYPE "public"."administrators_role_enum" AS ENUM('admin')`);
        await queryRunner.query(`ALTER TABLE "administrators" ADD "role" "public"."administrators_role_enum" DEFAULT 'admin'`);
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "UQ_ccc7c1489f3a6b3c9b47d4537c5"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP CONSTRAINT "UQ_ed1251fa3856cd1a6c98d7bcaa3"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP CONSTRAINT "UQ_1437a6c4896867bc247b7d297d7"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "lastChangedDateTime"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "createDateTime"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "isArchived"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "roles_id" integer NOT NULL`);
    }

}
