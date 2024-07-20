import { Component, Input } from '@angular/core';
import { Pokemon } from '../../store/pokemon';

@Component({
  selector: 'app-pokemon-list[pokemon]',
  standalone: true,
  imports: [],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
})
export class PokemonListComponent {
  @Input() pokemon!: Pokemon[];
}
