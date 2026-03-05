import { Component, effect, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ForumProject } from '../../../core/models/forum-project';
import { PostFiltersState, PostOrder } from '../../../core/models/forum-post';

const EMPTY_FILTERS: PostFiltersState = {
  projectId: '',
  selectedTag: '',
  search: '',
};

@Component({
  selector: 'app-post-filters',
  imports: [TranslatePipe],
  templateUrl: './post-filters.html',
  styleUrl: './post-filters.scss',
})
export class PostFilters {
  readonly projects = input<ForumProject[]>([]);
  readonly popularTags = input<string[]>([]);
  readonly filters = input<PostFiltersState>(EMPTY_FILTERS);
  readonly order = input<PostOrder>('date');

  readonly filtersChange = output<PostFiltersState>();
  readonly orderChange = output<PostOrder>();

  readonly searchValue = signal('');

  constructor() {
    effect(() => {
      this.searchValue.set(this.filters().search);
    });
  }

  onSearchInput(value: string): void {
    this.searchValue.set(value);
    this.emitFilters({ search: value });
  }

  onProjectChange(projectId: string): void {
    this.emitFilters({ projectId });
  }

  onTagSelect(tag: string): void {
    const selectedTag = this.filters().selectedTag === tag ? '' : tag;
    this.emitFilters({ selectedTag });
  }

  onOrderChange(order: string): void {
    this.orderChange.emit((order as PostOrder) || 'date');
  }

  clearFilters(): void {
    this.searchValue.set('');
    this.filtersChange.emit(EMPTY_FILTERS);
  }

  private emitFilters(partialFilters: Partial<PostFiltersState>): void {
    this.filtersChange.emit({
      ...this.filters(),
      ...partialFilters,
    });
  }
}
