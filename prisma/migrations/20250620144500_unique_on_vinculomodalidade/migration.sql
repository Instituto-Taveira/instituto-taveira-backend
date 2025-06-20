/*
  Warnings:

  - You are about to drop the column `bairro` on the `dependentes` table. All the data in the column will be lost.
  - You are about to drop the column `cep` on the `dependentes` table. All the data in the column will be lost.
  - You are about to drop the column `cidade` on the `dependentes` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `dependentes` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `dependentes` table. All the data in the column will be lost.
  - You are about to drop the column `rua` on the `dependentes` table. All the data in the column will be lost.
  - You are about to drop the column `bairro` on the `pessoas` table. All the data in the column will be lost.
  - You are about to drop the column `cep` on the `pessoas` table. All the data in the column will be lost.
  - You are about to drop the column `cidade` on the `pessoas` table. All the data in the column will be lost.
  - You are about to drop the column `complemento` on the `pessoas` table. All the data in the column will be lost.
  - You are about to drop the column `endereco` on the `pessoas` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `pessoas` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `pessoas` table. All the data in the column will be lost.
  - You are about to drop the column `pontoReferencia` on the `pessoas` table. All the data in the column will be lost.
  - You are about to drop the column `rua` on the `pessoas` table. All the data in the column will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[modalidadeId,pessoaId]` on the table `vinculo_modalidades` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[modalidadeId,dependenteId]` on the table `vinculo_modalidades` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `enderecoId` to the `pessoas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_roleId_fkey";

-- DropIndex
DROP INDEX "vinculo_modalidades_modalidadeId_pessoaId_dependenteId_key";

-- AlterTable
ALTER TABLE "dependentes" DROP COLUMN "bairro",
DROP COLUMN "cep",
DROP COLUMN "cidade",
DROP COLUMN "estado",
DROP COLUMN "numero",
DROP COLUMN "rua",
ADD COLUMN     "enderecoId" INTEGER;

-- AlterTable
ALTER TABLE "pessoas" DROP COLUMN "bairro",
DROP COLUMN "cep",
DROP COLUMN "cidade",
DROP COLUMN "complemento",
DROP COLUMN "endereco",
DROP COLUMN "estado",
DROP COLUMN "numero",
DROP COLUMN "pontoReferencia",
DROP COLUMN "rua",
ADD COLUMN     "enderecoId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "titular" (
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

    CONSTRAINT "titular_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enderecos" (
    "id" SERIAL NOT NULL,
    "cep" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "complemento" TEXT,
    "pontoReferencia" TEXT,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "enderecos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "titular_login_key" ON "titular"("login");

-- CreateIndex
CREATE UNIQUE INDEX "vinculo_modalidades_modalidadeId_pessoaId_key" ON "vinculo_modalidades"("modalidadeId", "pessoaId");

-- CreateIndex
CREATE UNIQUE INDEX "vinculo_modalidades_modalidadeId_dependenteId_key" ON "vinculo_modalidades"("modalidadeId", "dependenteId");

-- AddForeignKey
ALTER TABLE "titular" ADD CONSTRAINT "titular_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pessoas" ADD CONSTRAINT "pessoas_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "enderecos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependentes" ADD CONSTRAINT "dependentes_enderecoId_fkey" FOREIGN KEY ("enderecoId") REFERENCES "enderecos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
