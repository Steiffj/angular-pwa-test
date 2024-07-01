import { Component, OnInit, inject } from '@angular/core';
import { UserSessionService } from '../user-session/user-session.service';
import { PokemonListComponent } from '../pokemon-list/pokemon-list.component';

@Component({
  selector: 'app-table-window',
  standalone: true,
  imports: [PokemonListComponent],
  templateUrl: './table-window.component.html',
  styleUrl: './table-window.component.scss',
})
export class TableWindowComponent implements OnInit {
  readonly userSessionSvc = inject(UserSessionService);

  ngOnInit() {
    this.establishSession();
  }

  async establishSession() {
    await this.userSessionSvc.initSharedUserSession();
  }
}
