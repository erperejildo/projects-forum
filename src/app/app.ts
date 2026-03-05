import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppHeader } from './components/layout/app-header/app-header';
import { Language } from './core/services/language';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly language = inject(Language);

  constructor() {
    this.language.initialize();
  }
}
