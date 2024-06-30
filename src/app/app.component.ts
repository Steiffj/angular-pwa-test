import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataSyncService } from './store/data-sync.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  readonly dataSyncSvc = inject(DataSyncService);
  title = 'pwa';

  ngOnInit() {
    console.log('OnInit lifecycle hook - loading pokemon by type');
    this.loadPokemon();
  }

  async loadPokemon() {
    await this.dataSyncSvc.initWebWorker();
    this.dataSyncSvc.loadPokemonByType();
  }
}
