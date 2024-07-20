import { Component, OnInit, inject, signal } from '@angular/core';
import { SharedWorkerService } from '../../shared-worker/shared-worker.service';
import { PokemonListComponent } from '../../components/pokemon-list/pokemon-list.component';
import { Pokemon } from '../../store/pokemon';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [PokemonListComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableWindowComponent implements OnInit {
  readonly userSessionSvc = inject(SharedWorkerService);
  pokemon = signal<Pokemon[]>([]);

  ngOnInit() {
    this.establishSession();
    this.getSomePokemon();
  }

  async establishSession() {
    await this.userSessionSvc.connect();
  }

  async getSomePokemon() {
    const list = await this.userSessionSvc.getPokemonList('fairy');
    this.pokemon.set(list);
  }
}
