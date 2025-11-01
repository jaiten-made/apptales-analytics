import { EventSchema } from "@apptales/events-schema";
import { Prisma } from "@prisma/client";

// Adds runtime validation for Event create/update and a computed typedProperties field
export const eventsExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      event: {
        create({ args, query }) {
          const data = args.data;
          EventSchema.parse({ type: data.type, properties: data.properties });
          return query(args);
        },
        update({ args, query }) {
          const data = args.data;
          EventSchema.parse({ type: data.type, properties: data.properties });
          return query(args);
        },
      },
    },
  });
});

export type EventsExtension = typeof eventsExtension;
