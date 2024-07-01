import { Component, OnInit, inject, signal } from '@angular/core';
import { UserSessionService } from '../user-session/user-session.service';
import { PokemonListComponent } from '../pokemon-list/pokemon-list.component';
import { Pokemon } from '../store/pokemon';

@Component({
  selector: 'app-table-window',
  standalone: true,
  imports: [PokemonListComponent],
  templateUrl: './table-window.component.html',
  styleUrl: './table-window.component.scss',
})
export class TableWindowComponent implements OnInit {
  readonly userSessionSvc = inject(UserSessionService);
  pokemon = signal<Pokemon[]>([]);

  ngOnInit() {
    this.establishSession();
    this.getSomePokemon();
  }

  async establishSession() {
    await this.userSessionSvc.initSharedUserSession();
  }

  async getSomePokemon() {
    const list = await this.userSessionSvc.getPokemonList();
    this.pokemon.set(list);
  }
}
