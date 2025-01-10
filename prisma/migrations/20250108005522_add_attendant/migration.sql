-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "attendantId" TEXT;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_attendantId_fkey" FOREIGN KEY ("attendantId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
