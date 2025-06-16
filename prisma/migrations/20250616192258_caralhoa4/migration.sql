-- DropForeignKey
ALTER TABLE "Dependente" DROP CONSTRAINT "Dependente_pessoaId_fkey";

-- AddForeignKey
ALTER TABLE "Dependente" ADD CONSTRAINT "Dependente_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
