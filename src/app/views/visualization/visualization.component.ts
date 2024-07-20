import { ChangeDetectionStrategy, Component } from '@angular/core';
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
export class VisualizationComponent {}
