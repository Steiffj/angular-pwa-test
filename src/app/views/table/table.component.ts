import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { TableMessengerService } from 'messengers/table-messenger.service';
import { PokemonListComponent } from '../../components/pokemon-list/pokemon-list.component';

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

  constructor() {
    globalThis.onbeforeunload = () => {
      this.messenger.disconnect('table');
    };
  }

  ngOnInit() {
    this.messenger.connect('table');
    this.messenger.selectedType = 'grass';
  }

  ngOnDestroy() {
    console.log('Disconnecting from shared worker (component destroyed)');
    this.messenger.disconnect('table');
  }
}
