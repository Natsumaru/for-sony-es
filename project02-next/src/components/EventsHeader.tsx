import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EventsHeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  totalEvents: number;
  onToggleFilters: () => void;
  showFilters: boolean;
}

const EventsHeader: React.FC<EventsHeaderProps> = ({
  onSearchChange,
  searchQuery,
  totalEvents,
  onToggleFilters,
  showFilters
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">イベント一覧</h1>
          <p className="text-muted-foreground mt-1">
            {totalEvents}件のイベントが見つかりました
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onToggleFilters}
            variant={showFilters ? "secondary" : "ghost"}
            size="icon"
            className="shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="イベントを検索"
              className="pl-8 w-full sm:w-[250px]"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsHeader;