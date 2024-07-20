import { Component, OnInit, inject, signal } from '@angular/core';
import { SharedWorkerService } from '../shared-worker/shared-worker.service';
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
  readonly userSessionSvc = inject(SharedWorkerService);
  pokemon = signal<Pokemon[]>([]);

  ngOnInit() {
    this.establishSession();
    this.getSomePokemon();
  }

  async establishSession() {
    await this.userSessionSvc.initSharedUserSession();
  }

  async getSomePokemon() {
    const list = await this.userSessionSvc.getPokemonList('fairy');
    this.pokemon.set(list);
  }
}
