import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'action';
}

export interface TableFilter {
  column: string;
  value: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  totalItems: number;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit, OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  @Input() showFilters: boolean = true;
  @Input() showBulkActions: boolean = true;
  @Input() loading: boolean = false;

  // Make Math available in template
  Math = Math;

  @Output() pageChange = new EventEmitter<PaginationConfig>();
  @Output() sortChange = new EventEmitter<SortConfig>();
  @Output() filterChange = new EventEmitter<TableFilter[]>();
  @Output() bulkAction = new EventEmitter<{ action: string; items: any[] }>();

  // Internal state
  currentPage: number = 1;
  currentPageSize: number = 10;
  totalItems: number = 0;
  sortConfig: SortConfig | null = null;
  filters: TableFilter[] = [];
  selectedItems: Set<any> = new Set();
  selectAll: boolean = false;

  // Computed properties
  get filteredData(): any[] {
    let result = [...this.data];
    
    // Apply filters
    if (this.filters.length > 0) {
      result = result.filter(item => {
        return this.filters.every(filter => {
          const value = this.getNestedValue(item, filter.column);
          return this.matchesFilter(value, filter);
        });
      });
    }
    
    // Apply sorting
    if (this.sortConfig) {
      result.sort((a, b) => {
        const aValue = this.getNestedValue(a, this.sortConfig!.column);
        const bValue = this.getNestedValue(b, this.sortConfig!.column);
        return this.compareValues(aValue, bValue, this.sortConfig!.direction);
      });
    }
    
    return result;
  }

  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.currentPageSize;
    const endIndex = startIndex + this.currentPageSize;
    return this.filteredData.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.currentPageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  ngOnInit() {
    this.currentPageSize = this.pageSize;
    this.totalItems = this.data.length;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.totalItems = this.data.length;
      this.currentPage = 1;
      this.selectedItems.clear();
      this.selectAll = false;
    }
  }

  // Pagination methods
  onPageChange(page: number) {
    this.currentPage = page;
    this.emitPageChange();
  }

  onPageSizeChange(pageSize: number) {
    this.currentPageSize = pageSize;
    this.currentPage = 1;
    this.emitPageChange();
  }

  // Sorting methods
  onSort(column: string) {
    if (this.sortConfig?.column === column) {
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortConfig = { column, direction: 'asc' };
    }
    this.sortChange.emit(this.sortConfig);
  }

  getSortIcon(column: string): string {
    if (this.sortConfig?.column !== column) return '↕️';
    return this.sortConfig.direction === 'asc' ? '↑' : '↓';
  }

  // Filtering methods
  addFilter(column: string, value: string, operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan') {
    if (!value.trim()) return;
    
    const existingFilterIndex = this.filters.findIndex(f => f.column === column);
    if (existingFilterIndex >= 0) {
      this.filters[existingFilterIndex] = { column, value: value.trim(), operator };
    } else {
      this.filters.push({ column, value: value.trim(), operator });
    }
    
    this.currentPage = 1;
    this.filterChange.emit(this.filters);
  }

  removeFilter(column: string) {
    this.filters = this.filters.filter(f => f.column !== column);
    this.currentPage = 1;
    this.filterChange.emit(this.filters);
  }

  clearAllFilters() {
    this.filters = [];
    this.currentPage = 1;
    this.filterChange.emit(this.filters);
  }

  // Bulk selection methods
  toggleSelectAll() {
    if (this.selectAll) {
      this.selectedItems.clear();
    } else {
      this.paginatedData.forEach(item => this.selectedItems.add(item));
    }
    this.selectAll = !this.selectAll;
  }

  toggleItemSelection(item: any) {
    if (this.selectedItems.has(item)) {
      this.selectedItems.delete(item);
    } else {
      this.selectedItems.add(item);
    }
    this.updateSelectAllState();
  }

  isItemSelected(item: any): boolean {
    return this.selectedItems.has(item);
  }

  onBulkAction(action: string) {
    if (this.selectedItems.size === 0) return;
    this.bulkAction.emit({ action, items: Array.from(this.selectedItems) });
  }

  // Utility methods
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private matchesFilter(value: any, filter: TableFilter): boolean {
    if (value == null) return false;
    
    const strValue = String(value).toLowerCase();
    const filterValue = filter.value.toLowerCase();
    
    switch (filter.operator) {
      case 'contains':
        return strValue.includes(filterValue);
      case 'equals':
        return strValue === filterValue;
      case 'startsWith':
        return strValue.startsWith(filterValue);
      case 'endsWith':
        return strValue.endsWith(filterValue);
      case 'greaterThan':
        return Number(value) > Number(filter.value);
      case 'lessThan':
        return Number(value) < Number(filter.value);
      default:
        return true;
    }
  }

  private compareValues(a: any, b: any, direction: 'asc' | 'desc'): number {
    if (a == null && b == null) return 0;
    if (a == null) return direction === 'asc' ? -1 : 1;
    if (b == null) return direction === 'asc' ? 1 : -1;
    
    if (typeof a === 'string' && typeof b === 'string') {
      return direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
    }
    
    if (typeof a === 'number' && typeof b === 'number') {
      return direction === 'asc' ? a - b : b - a;
    }
    
    if (a instanceof Date && b instanceof Date) {
      return direction === 'asc' ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
    }
    
    return 0;
  }

  private updateSelectAllState() {
    const selectedCount = this.selectedItems.size;
    const totalCount = this.paginatedData.length;
    this.selectAll = selectedCount === totalCount && totalCount > 0;
  }

  private emitPageChange() {
    this.pageChange.emit({
      page: this.currentPage,
      pageSize: this.currentPageSize,
      totalItems: this.filteredData.length
    });
  }

  // Track by function for performance
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
