import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IconButtonDirective } from 'directives/icon-button.directive';
import { openPwaWindow } from 'open-pwa-window';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [IconButtonDirective],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
  readonly router = inject(Router);
  readonly activatedRoute = inject(ActivatedRoute);

  popOutTable(route: string) {
    openPwaWindow(route, {
      height: window.innerHeight * 0.8,
      width: window.innerWidth * 0.8,
    });

    const onCombinedView = this.activatedRoute.snapshot.url.filter((url) => {
      console.debug(url.path);
      return url.path.includes('combined');
    });

    if (onCombinedView) {
      this.router.navigate(['visualization-standalone']);
    }
  }
}
