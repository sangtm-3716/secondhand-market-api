import { MigrationInterface, QueryRunner } from "typeorm";

export class UserRole1795434034120 implements MigrationInterface {
    name = 'UserRole1795434034120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "role" character varying(20) NOT NULL DEFAULT 'member'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    }

}
