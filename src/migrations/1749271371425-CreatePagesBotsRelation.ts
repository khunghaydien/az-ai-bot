import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePagesBotsRelation1749271371425 implements MigrationInterface {
    name = 'CreatePagesBotsRelation1749271371425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "FK_68c82e500a6216e8e2652930010"`);
        await queryRunner.query(`CREATE TABLE "pages_bots" ("page_id" uuid NOT NULL, "bot_id" uuid NOT NULL, CONSTRAINT "PK_9639154ce32e5f3efbcaf8c1f99" PRIMARY KEY ("page_id", "bot_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9af12efd0ab12921f59ae7b25b" ON "pages_bots" ("page_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2c1be2d74306d7b31b10cc372a" ON "pages_bots" ("bot_id") `);
        await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN "bot_id"`);
        await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "FK_666ad31d630b4887e465994bf23"`);
        await queryRunner.query(`ALTER TABLE "pages" ALTER COLUMN "product_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bots" DROP CONSTRAINT "FK_5da286413177d0a20e7f1a4731f"`);
        await queryRunner.query(`ALTER TABLE "bots" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pages" ADD CONSTRAINT "FK_666ad31d630b4887e465994bf23" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bots" ADD CONSTRAINT "FK_5da286413177d0a20e7f1a4731f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pages_bots" ADD CONSTRAINT "FK_9af12efd0ab12921f59ae7b25b1" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "pages_bots" ADD CONSTRAINT "FK_2c1be2d74306d7b31b10cc372ac" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pages_bots" DROP CONSTRAINT "FK_2c1be2d74306d7b31b10cc372ac"`);
        await queryRunner.query(`ALTER TABLE "pages_bots" DROP CONSTRAINT "FK_9af12efd0ab12921f59ae7b25b1"`);
        await queryRunner.query(`ALTER TABLE "bots" DROP CONSTRAINT "FK_5da286413177d0a20e7f1a4731f"`);
        await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "FK_666ad31d630b4887e465994bf23"`);
        await queryRunner.query(`ALTER TABLE "bots" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bots" ADD CONSTRAINT "FK_5da286413177d0a20e7f1a4731f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pages" ALTER COLUMN "product_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pages" ADD CONSTRAINT "FK_666ad31d630b4887e465994bf23" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pages" ADD "bot_id" uuid NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2c1be2d74306d7b31b10cc372a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9af12efd0ab12921f59ae7b25b"`);
        await queryRunner.query(`DROP TABLE "pages_bots"`);
        await queryRunner.query(`ALTER TABLE "pages" ADD CONSTRAINT "FK_68c82e500a6216e8e2652930010" FOREIGN KEY ("bot_id") REFERENCES "bots"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
