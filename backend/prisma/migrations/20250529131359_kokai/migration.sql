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
    "parts" TEXT,
    "customerFeedback" TEXT,
    "technicianId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ticket_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("address", "arrivalTime", "contact", "createdAt", "customerFeedback", "customerName", "description", "deviceModel", "deviceName", "finishTime", "id", "parts", "phone", "priority", "serialNumber", "solution", "status", "technicianId", "title", "updatedAt") SELECT "address", "arrivalTime", "contact", "createdAt", "customerFeedback", "customerName", "description", "deviceModel", "deviceName", "finishTime", "id", "parts", "phone", "priority", "serialNumber", "solution", "status", "technicianId", "title", "updatedAt" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
