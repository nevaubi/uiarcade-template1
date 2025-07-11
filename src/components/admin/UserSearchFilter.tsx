
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UserSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  adminFilter: string;
  onAdminFilterChange: (value: string) => void;
  subscriptionFilter: string;
  onSubscriptionFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  resultCount: number;
  totalCount: number;
}

const UserSearchFilter: React.FC<UserSearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  adminFilter,
  onAdminFilterChange,
  subscriptionFilter,
  onSubscriptionFilterChange,
  sortBy,
  onSortChange,
  onClearFilters,
  resultCount,
  totalCount
}) => {
  const hasActiveFilters = searchTerm || adminFilter !== 'all' || subscriptionFilter !== 'all' || sortBy !== 'newest';

  return (
    <Card className="mb-6 bg-muted/30 border-0">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters:</span>
            </div>

            <Select value={adminFilter} onValueChange={onAdminFilterChange}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>

            <Select value={subscriptionFilter} onValueChange={onSubscriptionFilterChange}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Subscription" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="h-9 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span>
                Showing <span className="font-medium text-foreground">{resultCount}</span> of <span className="font-medium text-foreground">{totalCount}</span> users
              </span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs">
                  Filtered
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSearchFilter;
