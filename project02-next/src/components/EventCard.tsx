import React from "react";
import { Calendar, MapPin, DollarSign, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Tag as TagType } from "@prisma/client";
import type { EventWithOwnerAndTags } from "@/types/event";

type EventCardProps = {
  event: EventWithOwnerAndTags;
};

const formatDate = (date: string | Date): string => {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
  }).format(amount);
};

const EventTag: React.FC<{ tag: TagType }> = ({ tag }) => {
  return (
    <Badge
      variant="outline"
      style={{
        backgroundColor: `${tag.color}10`,
        color: tag.color,
        borderColor: `${tag.color}30`,
      }}
    >
      {tag.name}
    </Badge>
  );
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full w-full">
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            event.imageUrl ||
            "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg"
          }
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="shadow-sm">
            <Calendar className="w-3 h-3 mr-1" />
            <span>
              {new Date(event.scheduledAt) < new Date()
                ? "終了しました"
                : "開催予定"}
            </span>
          </Badge>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-card-foreground line-clamp-1">
            {event.title}
          </h3>
          {event.owner.isVerified && (
            <Badge variant="secondary" className="text-teal-600 bg-teal-50">
              <Check className="w-3 h-3 mr-1" />
              <span className="text-xs">公認</span>
            </Badge>
          )}
        </div>

        <p className="text-muted-foreground text-sm mb-4 truncate">
          {event.description}
        </p>

        <div className="mt-auto space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            <span>{formatDate(event.scheduledAt)}</span>
          </div>

          <div className="flex items-center text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center text-muted-foreground">
            <DollarSign className="w-4 h-4 mr-2 text-primary" />
            <span>{formatCurrency(event.price)}</span>
          </div>
        </div>

        <div className="relative mt-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pr-6">
            {event.tags.map((tag) => (
              <EventTag key={tag.id} tag={tag} />
            ))}
          </div>
          <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-card to-transparent" />
        </div>

        <div className="flex items-center mt-4 pt-4 border-t">
          <img
            src={
              event.owner.imageUrl ||
              "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
            }
            alt={event.owner.displayName || "Unknown user"}
            className="w-6 h-6 rounded-full object-cover mr-2"
          />
          <span className="text-sm text-muted-foreground">
            <span className="font-medium text-card-foreground">
              {event.owner.displayName}
            </span>
            <span className="mx-1">が主催</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
