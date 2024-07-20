import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { TableMessengerService } from 'messengers/table-messenger.service';
import { VisualizationMessengerService } from 'messengers/visualization-messenger.service';
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

  ngOnInit() {
    this.messenger.connect();
    this.getSomePokemon();
  }

  ngOnDestroy() {
    this.messenger.disconnect();
  }

  async getSomePokemon() {
    const list = await this.messenger.getPokemonList('fairy');
    this.pokemon.set(list);
  }
}
