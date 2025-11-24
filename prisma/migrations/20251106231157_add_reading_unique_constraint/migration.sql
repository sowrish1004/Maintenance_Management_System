/*
  Warnings:

  - A unique constraint covering the columns `[inspectionId,categoryId]` on the table `Reading` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reading_inspectionId_categoryId_key" ON "Reading"("inspectionId", "categoryId");
