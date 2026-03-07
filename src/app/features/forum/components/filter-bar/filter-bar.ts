import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PostOrder } from '../../../../core/models/forum-models';
import { ForumProject } from '../../../../core/models/forum-models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-filter-bar',
  imports: [TranslatePipe, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss',
})
export class FilterBar {
  readonly projects = input<ForumProject[]>([]);
  readonly tags = input<string[]>([]);
  readonly selectedProject = input('');
  readonly selectedTag = input('');
  readonly search = input('');
  readonly order = input<PostOrder>('date');

  readonly filterChange = output<{
    projectId?: string;
    tag?: string;
    search?: string;
    order?: PostOrder;
  }>();

  onProjectChange(value: string): void {
    this.filterChange.emit({ projectId: value });
  }

  onTagChange(value: string): void {
    this.filterChange.emit({ tag: value });
  }

  onOrderChange(value: PostOrder): void {
    this.filterChange.emit({ order: value });
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterChange.emit({ search: value });
  }
}
