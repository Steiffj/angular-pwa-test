import { Component, OnInit, inject } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { openPwaWindow } from '../open-pwa-window';
import { DataSyncService } from '../store/data-sync.service';
import { UserSessionService } from '../user-session/user-session.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  #router = inject(Router);
  #activatedRoute = inject(ActivatedRoute);
  readonly dataSyncSvc = inject(DataSyncService);
  readonly userSessionSvc = inject(UserSessionService);

  ngOnInit() {
    console.log('OnInit lifecycle hook');
    this.establishUserSession();
    this.loadPokemon();
  }

  async loadPokemon() {
    await this.dataSyncSvc.initWebWorker();
    this.dataSyncSvc.loadPokemonByType();
  }

  async establishUserSession() {
    await this.userSessionSvc.initSharedUserSession();
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
