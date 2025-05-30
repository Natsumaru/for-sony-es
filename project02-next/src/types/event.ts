// types/event.ts
import { Prisma } from '@prisma/client';

export type EventWithOwnerAndTags = Prisma.EventGetPayload<{
  include: {
    owner: true;
    tags: true;
  };
}>;
