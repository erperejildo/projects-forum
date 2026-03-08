import { Component, input, output, signal, ViewChild, ElementRef } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-tag-input',
  imports: [
    TranslatePipe,
    MatIconModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './tag-input.html',
  styleUrl: './tag-input.scss',
})
export class TagInput {
  @ViewChild('tagInput') tagInput?: ElementRef<HTMLInputElement>;
  readonly tags = input<string[]>([]);
  readonly tagsChange = output<string[]>();
  readonly draft = signal('');

  onDraftInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.draft.set(value);
  }

  onDraftKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ',') {
      return;
    }

    event.preventDefault();
    this.commitDraft();
  }

  commitDraft(): void {
    const tag = this.normalizeTag(this.draft());
    if (!tag) {
      return;
    }

    const uniqueTags = Array.from(new Set([...this.tags(), tag]));
    this.tagsChange.emit(uniqueTags);
    this.draft.set('');
  }

  removeTag(tag: string): void {
    const filtered = this.tags().filter((entry) => entry !== tag);
    this.tagsChange.emit(filtered);
  }

  private normalizeTag(raw: string): string {
    return raw
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
}
