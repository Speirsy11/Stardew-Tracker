-- CreateTable
CREATE TABLE "GameItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "sellPrice" INTEGER,
    "description" TEXT,
    "obtainMethod" TEXT NOT NULL,
    "season" TEXT,
    "location" TEXT,
    "imageSlug" TEXT,
    "cropName" TEXT,

    CONSTRAINT "GameItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameItem_name_key" ON "GameItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GameItem_slug_key" ON "GameItem"("slug");
