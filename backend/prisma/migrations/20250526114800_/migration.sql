/*
  Warnings:

  - You are about to drop the column `优先级` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `创建时间` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `到达时间` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `地址` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `完成时间` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `客户名称` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `客户意见` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `工单标题` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `序列号` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `故障描述` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `更换配件` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `更新时间` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `状态` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `联系人` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `联系电话` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `解决方案` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `设备名称` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `设备型号` on the `Ticket` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL DEFAULT '新工单',
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "customerName" TEXT,
    "contact" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "deviceName" TEXT,
    "deviceModel" TEXT,
    "serialNumber" TEXT,
    "solution" TEXT,
    "arrivalTime" DATETIME,
    "finishTime" DATETIME,
    "parts" JSONB,
    "customerFeedback" TEXT,
    "technicianId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ticket_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("id", "technicianId") SELECT "id", "technicianId" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
