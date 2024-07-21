import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { POKEMON_TYPE } from '__typegen/types';
import { GraphComponent } from 'components/graph/graph.component';
import { VisualizationMessengerService } from 'messengers/visualization-messenger.service';

@Component({
  selector: 'app-visualization',
  standalone: true,
  imports: [GraphComponent],
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
    this.messenger.connect('visualization');
    this.messenger.generateGraph([...POKEMON_TYPE]);
  }

  ngOnDestroy() {
    console.log('Disconnecting from shared worker (component destroyed)');
    this.messenger.disconnect('visualization');
  }
}
