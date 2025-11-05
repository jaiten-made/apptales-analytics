WITH ordered AS (
  SELECT
    e."sessionId",
    e."eventIdentityId",
    ROW_NUMBER() OVER (
      PARTITION BY e."sessionId"
      ORDER BY e."createdAt"
    ) AS step
  FROM "Event" e
  WHERE e."eventIdentityId" IS NOT NULL
    AND e."projectId" = ''
)
SELECT
  step,
  ei."key" AS event_key,
  COUNT(*) AS count
FROM ordered
JOIN "EventIdentity" ei ON ei.id = ordered."eventIdentityId"
GROUP BY step, ei."key"
ORDER BY step, count DESC;