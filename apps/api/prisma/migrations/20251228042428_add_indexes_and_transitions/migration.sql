-- CreateTable
CREATE TABLE "Transition" (
    "id" TEXT NOT NULL,
    "fromEventIdentityId" TEXT NOT NULL,
    "toEventIdentityId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgDurationMs" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transition_projectId_fromEventIdentityId_idx" ON "Transition"("projectId", "fromEventIdentityId");

-- CreateIndex
CREATE INDEX "Transition_projectId_toEventIdentityId_idx" ON "Transition"("projectId", "toEventIdentityId");

-- CreateIndex
CREATE UNIQUE INDEX "Transition_fromEventIdentityId_toEventIdentityId_projectId_key" ON "Transition"("fromEventIdentityId", "toEventIdentityId", "projectId");

-- CreateIndex
CREATE INDEX "Event_sessionId_createdAt_idx" ON "Event"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "Event_eventIdentityId_idx" ON "Event"("eventIdentityId");

-- CreateIndex
CREATE INDEX "Event_createdAt_idx" ON "Event"("createdAt");

-- CreateIndex
CREATE INDEX "EventIdentity_key_idx" ON "EventIdentity"("key");

-- CreateIndex
CREATE INDEX "Session_projectId_idx" ON "Session"("projectId");

-- AddForeignKey
ALTER TABLE "Transition" ADD CONSTRAINT "Transition_fromEventIdentityId_fkey" FOREIGN KEY ("fromEventIdentityId") REFERENCES "EventIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transition" ADD CONSTRAINT "Transition_toEventIdentityId_fkey" FOREIGN KEY ("toEventIdentityId") REFERENCES "EventIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transition" ADD CONSTRAINT "Transition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
