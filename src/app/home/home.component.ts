import { Component, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { openPwaWindow } from '../open-pwa-window';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  #router = inject(Router);

  openInNewWindow(route: string) {
    openPwaWindow(route, {
      height: window.innerHeight * 0.8,
      width: window.innerWidth * 0.8,
    });
  }

  popOutTable(route: string) {
    openPwaWindow(route, {
      height: window.innerHeight * 0.8,
      width: window.innerWidth * 0.8,
    });
    this.#router.navigate(['table-popout']);
  }
}
