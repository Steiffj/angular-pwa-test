import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { CombinedMessengerService } from 'messengers/combined-messenger.service';
import { POKEMON_TYPE } from '../../__typegen/types';
import { GraphComponent } from '../../components/graph/graph.component';
import { openPwaWindow } from '../../open-pwa-window';
import { DataSyncService } from '../../store/data-sync.service';
import { TableMessengerService } from 'messengers/table-messenger.service';
import { VisualizationMessengerService } from 'messengers/visualization-messenger.service';

@Component({
  selector: 'app-combined',
  standalone: true,
  imports: [RouterOutlet, RouterModule, GraphComponent],
  providers: [
    CombinedMessengerService,
    TableMessengerService,
    VisualizationMessengerService,
  ],
  templateUrl: './combined.component.html',
  styleUrl: './combined.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombinedComponent implements OnInit, OnDestroy {
  #router = inject(Router);
  #activatedRoute = inject(ActivatedRoute);
  readonly dataSyncSvc = inject(DataSyncService);
  readonly messenger = inject(CombinedMessengerService);

  ngOnInit() {
    console.log('OnInit lifecycle hook');
    this.messenger.connect();
    this.loadPokemon();
    this.messenger.visualization.generateGraph([...POKEMON_TYPE]);
  }

  ngOnDestroy() {
    this.messenger.disconnect();
  }

  async loadPokemon() {
    await this.dataSyncSvc.initWebWorker();
    this.dataSyncSvc.loadPokemonByType();
  }

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
    this.#router.navigate(['table-popout'], {
      relativeTo: this.#activatedRoute,
    });
  }
}
