import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-visualization',
  standalone: true,
  imports: [],
  templateUrl: './visualization.component.html',
  styleUrl: './visualization.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisualizationComponent {

}