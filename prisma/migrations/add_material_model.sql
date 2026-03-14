-- CreateEnum
CREATE TYPE "MaterialFormat" AS ENUM ('TEXTURE', 'PANORAMA', 'VIDEO', 'PHOTO');

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "format" "MaterialFormat" NOT NULL,
    "url" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Material_designId_idx" ON "Material"("designId");

-- CreateIndex
CREATE INDEX "Material_format_idx" ON "Material"("format");

-- CreateIndex
CREATE INDEX "Material_designId_format_idx" ON "Material"("designId", "format");

-- AddForeignKey
ALTER TABLE "Material" ADD CONSTRAINT "Material_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;



