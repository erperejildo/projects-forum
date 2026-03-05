import { Component, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-tag-input',
  imports: [TranslatePipe],
  templateUrl: './tag-input.html',
  styleUrl: './tag-input.scss',
})
export class TagInput {
  readonly tags = input<string[]>([]);
  readonly tagsChange = output<string[]>();

  readonly draft = signal('');

  onDraftChange(value: string): void {
    this.draft.set(value);
  }

  addTag(): void {
    const normalizedTag = this.normalizeTag(this.draft());

    if (!normalizedTag) {
      this.draft.set('');
      return;
    }

    if (this.tags().includes(normalizedTag)) {
      this.draft.set('');
      return;
    }

    const nextTags = [...this.tags(), normalizedTag].slice(0, 5);
    this.tagsChange.emit(nextTags);
    this.draft.set('');
  }

  removeTag(tag: string): void {
    this.tagsChange.emit(this.tags().filter((currentTag) => currentTag !== tag));
  }

  onEnterKey(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ',') {
      return;
    }

    event.preventDefault();
    this.addTag();
  }

  private normalizeTag(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  }
}
