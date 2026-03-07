import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-like-button',
  imports: [MatButtonModule, MatIcon],
  templateUrl: './like-button.html',
  styleUrl: './like-button.scss',
})
export class LikeButton {
  readonly liked = input(false);
  readonly likesCount = input(0);
  readonly disabled = input(false);

  readonly toggled = output<void>();

  onToggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.disabled()) {
      return;
    }

    this.toggled.emit();
  }
}
