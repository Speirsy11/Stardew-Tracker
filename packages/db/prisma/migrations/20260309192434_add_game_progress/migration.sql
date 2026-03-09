-- CreateTable
CREATE TABLE "UserGameProgress" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "itemSlug" TEXT NOT NULL,
    "listType" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserGameProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGameProgress_userId_itemSlug_listType_key" ON "UserGameProgress"("userId", "itemSlug", "listType");

-- AddForeignKey
ALTER TABLE "UserGameProgress" ADD CONSTRAINT "UserGameProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
