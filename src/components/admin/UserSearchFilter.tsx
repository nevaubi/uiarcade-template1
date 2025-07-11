
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';

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
    <div className="space-y-4 mb-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        <Select value={adminFilter} onValueChange={onAdminFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Admin Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="admin">Admins Only</SelectItem>
            <SelectItem value="user">Users Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={subscriptionFilter} onValueChange={onSubscriptionFilterChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Subscription" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="email">Email A-Z</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {resultCount} of {totalCount} users
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Filtered
            </Badge>
          )}
        </span>
      </div>
    </div>
  );
};

export default UserSearchFilter;
