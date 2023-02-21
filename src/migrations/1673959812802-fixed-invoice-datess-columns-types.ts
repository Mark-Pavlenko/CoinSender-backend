import { MigrationInterface, QueryRunner } from "typeorm";

export class fixedInvoiceDatesColumnsTypes1673959812802 implements MigrationInterface {
    name = 'fixedInvoiceDatesColumnsTypes1673959812802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "created_date"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "created_date" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "due_date"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "due_date" date NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "due_date"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "due_date" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "created_date"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "created_date" TIMESTAMP NOT NULL`);
    }

}
