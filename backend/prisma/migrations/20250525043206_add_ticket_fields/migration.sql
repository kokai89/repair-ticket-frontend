/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Ticket` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "工单标题" TEXT NOT NULL DEFAULT '新工单',
    "故障描述" TEXT NOT NULL DEFAULT '',
    "状态" TEXT NOT NULL DEFAULT 'pending',
    "优先级" TEXT NOT NULL DEFAULT 'medium',
    "客户名称" TEXT,
    "联系人" TEXT,
    "联系电话" TEXT,
    "地址" TEXT,
    "设备名称" TEXT,
    "设备型号" TEXT,
    "序列号" TEXT,
    "解决方案" TEXT,
    "到达时间" DATETIME,
    "完成时间" DATETIME,
    "更换配件" JSONB,
    "客户意见" TEXT,
    "technicianId" INTEGER NOT NULL,
    "创建时间" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "更新时间" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ticket_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("id", "technicianId") SELECT "id", "technicianId" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
