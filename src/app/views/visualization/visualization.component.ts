import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VisualizationMessengerService } from 'messengers/visualization-messenger.service';

@Component({
  selector: 'app-visualization',
  standalone: true,
  imports: [],
  providers: [VisualizationMessengerService],
  templateUrl: './visualization.component.html',
  styleUrl: './visualization.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisualizationComponent {
  readonly messenger = inject(VisualizationMessengerService);

  constructor() {
    globalThis.onbeforeunload = () => {
      this.messenger.disconnect('visualization');
    };
  }

  ngOnInit() {
    this.messenger.connect('table');
  }

  ngOnDestroy() {
    console.log('Disconnecting from shared worker (component destroyed)');
    this.messenger.disconnect('visualization');
  }
}
