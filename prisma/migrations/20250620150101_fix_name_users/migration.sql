/*
  Warnings:

  - You are about to drop the column `pessoaId` on the `dependentes` table. All the data in the column will be lost.
  - You are about to drop the column `pessoaId` on the `vinculo_modalidades` table. All the data in the column will be lost.
  - You are about to drop the `pessoas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `titular` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[modalidadeId,titularId]` on the table `vinculo_modalidades` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `titularId` to the `dependentes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "dependentes" DROP CONSTRAINT "dependentes_pessoaId_fkey";

-- DropForeignKey
ALTER TABLE "pessoas" DROP CONSTRAINT "pessoas_enderecoId_fkey";

-- DropForeignKey
ALTER TABLE "titular" DROP CONSTRAINT "titular_roleId_fkey";

-- DropForeignKey
ALTER TABLE "vinculo_modalidades" DROP CONSTRAINT "vinculo_modalidades_pessoaId_fkey";

-- DropIndex
DROP INDEX "vinculo_modalidades_modalidadeId_pessoaId_key";

-- AlterTable
ALTER TABLE "dependentes" DROP COLUMN "pessoaId",
ADD COLUMN     "titularId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "vinculo_modalidades" DROP COLUMN "pessoaId",
ADD COLUMN     "titularId" INTEGER;

-- DropTable
DROP TABLE "pessoas";

-- DropTable
DROP TABLE "titular";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdm" BOOLEAN NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "firstLogin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleId" INTEGER,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "titulares" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "cpf" TEXT,
    "rg" TEXT,
    "tituloEleitor" TEXT,
    "zona" TEXT,
    "secao" TEXT,
    "localVotacao" TEXT,
    "cartaoSUS" TEXT,
    "numeroContato" TEXT,
    "whatsapp" TEXT,
    "fotoBase64" TEXT,
    "enderecoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roleId" INTEGER,

    CONSTRAINT "titulares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "titulares_cpf_key" ON "titulares"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "vinculo_modalidades_modalidadeId_titularId_key" ON "vinculo_modalidades"("modalidadeId", "titularId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "titulares" ADD CONSTRAINT "titulares_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "enderecos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependentes" ADD CONSTRAINT "dependentes_titularId_fkey" FOREIGN KEY ("titularId") REFERENCES "titulares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vinculo_modalidades" ADD CONSTRAINT "vinculo_modalidades_titularId_fkey" FOREIGN KEY ("titularId") REFERENCES "titulares"("id") ON DELETE CASCADE ON UPDATE CASCADE;
