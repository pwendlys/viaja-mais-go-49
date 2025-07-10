
import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RideHistoryFilters as FilterType } from '@/types/rideHistory';

interface RideHistoryFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onClearFilters: () => void;
}

const RideHistoryFilters: React.FC<RideHistoryFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const updateFilter = (key: keyof FilterType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = filters.search || 
    filters.status !== 'all' || 
    filters.transportType !== 'all' || 
    filters.dateFrom || 
    filters.dateTo;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por origem, destino ou observações..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <Select 
              value={filters.status} 
              onValueChange={(value) => updateFilter('status', value)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {/* Transport Type Filter */}
            <Select 
              value={filters.transportType} 
              onValueChange={(value) => updateFilter('transportType', value)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo de Transporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="tradicional">Tradicional</SelectItem>
                <SelectItem value="acessivel">Acessível</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  type="date"
                  placeholder="Data inicial"
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  placeholder="Data final"
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Limpar Filtros</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RideHistoryFilters;
