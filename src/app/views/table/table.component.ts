import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { TableMessengerService } from 'messengers/table-messenger.service';
import { PokemonListComponent } from '../../components/pokemon-list/pokemon-list.component';
import { Pokemon } from '../../store/pokemon';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [PokemonListComponent],
  providers: [TableMessengerService],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableWindowComponent implements OnInit, OnDestroy {
  readonly messenger = inject(TableMessengerService);
  pokemon = signal<Pokemon[]>([]);

  constructor() {
    globalThis.onbeforeunload = () => {
      this.messenger.disconnect('table');
    };
  }

  ngOnInit() {
    this.messenger.connect('table');
    this.getSomePokemon();
  }

  ngOnDestroy() {
    console.log('Disconnecting from shared worker (component destroyed)');
    this.messenger.disconnect('table');
  }

  async getSomePokemon() {
    const list = await this.messenger.getPokemonList('fairy');
    this.pokemon.set(list);
  }
}
