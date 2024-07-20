import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { openPwaWindow } from '../../open-pwa-window';
import { DataSyncService } from '../../store/data-sync.service';
import { SharedWorkerService } from '../../shared-worker/shared-worker.service';
import { GraphComponent } from '../../components/graph/graph.component';
import { POKEMON_TYPE } from '../../__typegen/types';

@Component({
  selector: 'app-combined',
  standalone: true,
  imports: [RouterOutlet, RouterModule, GraphComponent],
  templateUrl: './combined.component.html',
  styleUrl: './combined.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombinedComponent implements OnInit {
  #router = inject(Router);
  #activatedRoute = inject(ActivatedRoute);
  readonly dataSyncSvc = inject(DataSyncService);
  readonly userSessionSvc = inject(SharedWorkerService);

  ngOnInit() {
    console.log('OnInit lifecycle hook');
    this.establishUserSession();
    this.loadPokemon();
    this.userSessionSvc.generateGraph([...POKEMON_TYPE]);
  }

  async loadPokemon() {
    await this.dataSyncSvc.initWebWorker();
    this.dataSyncSvc.loadPokemonByType();
  }

  async establishUserSession() {
    await this.userSessionSvc.connect();
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
