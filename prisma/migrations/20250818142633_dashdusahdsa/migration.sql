-- DropIndex
DROP INDEX "pagamentos_reference_id_key";

-- AlterTable
ALTER TABLE "pagamentos" ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "amountPayed" INTEGER,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "willReceive" INTEGER;
