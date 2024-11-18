import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { PokeServiceService } from './poke-service.service';
import { PokemonInfo } from './interfaces';
import { Subject, takeUntil, switchMap, forkJoin } from 'rxjs';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SearchModalComponent } from '../search-modal/search-modal.component';
import { SnackBarService } from '../snackbar/snack-bar.service';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';

type Params = {
  offset: number;
  limit: number;
};

@Component({
  selector: 'app-poke-list',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './poke-list.component.html',
  styleUrls: ['./poke-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PokeListComponent implements OnInit {
  private readonly pokeServe = inject(PokeServiceService);
  private readonly snackbarService = inject(SnackBarService);
  private _unsubscribe = new Subject<void>();
  private readonly dialog = inject(MatDialog);

  public listData = signal<PokemonInfo[]>([]);
  public params = signal<Params>({ limit: 20, offset: 0 });
  public totalItem = signal<number>(0);
  public searchValue = signal<string>('');
  public pokemonInfo = signal<PokemonInfo>({} as PokemonInfo);

  ngOnInit(): void {
    this.loadList();
  }

  loadList(): void {
    this.pokeServe
      .getPokeList(this.params())
      .pipe(
        takeUntil(this._unsubscribe),
        switchMap(({ results, count }) => {
          this.totalItem.set(count);

          const pokemonDetails = results.map((pokemon) =>
            this.pokeServe.searchPokemon(pokemon.name)
          );

          return forkJoin(pokemonDetails);
        })
      )
      .subscribe({
        next: (pokemonInfos) => {
          this.listData.set(pokemonInfos);
        },
        error: () => this.snackbarService.openSnackBar('Error al cargar la lista de Pokémon', 'Ok'),
      });
  }

  searchPokemon(): void {
    if (!this.searchValue().trim()) {
      this.snackbarService.openSnackBar('Por favor ingresa un nombre para buscar.', 'Ok');
      return;
    }
    this.fetchPokemonData(this.searchValue());
  }

  fetchPokemonData(searchValue: string): void {
    this.pokeServe.searchPokemon(searchValue)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe({
        next: (data) => {
          this.pokemonInfo.set(data);
          this.snackbarService.openSnackBar('Datos encontrados', 'Wi');
          this.openInfoModal(this.pokemonInfo());
        },
        error: () =>
          this.snackbarService.openSnackBar(`No se encontró información del Pokémon ${searchValue}`, 'Ok'),
      });
  }

  openSearchModal(): void {
    this.dialog
      .open(SearchModalComponent, { height: 'auto', width: '650px', disableClose: false })
      .afterClosed()
      .subscribe({
        next: (data) => {
          if (data) {
            this.searchValue.set(data);
            this.searchPokemon();
          }
        },
      });
  }

  openInfoModal(data: unknown): void {
    this.dialog.open(PokemonCardComponent, {
      height: 'auto',
      width: '430px',
      disableClose: false,
      data: data,
    });
  }

  chargeCard(pokemon: PokemonInfo): void {
    this.searchValue.set(pokemon.name.toLowerCase());
    this.fetchPokemonData(pokemon.name.toLowerCase());
  }

  onPageChange(event: PageEvent): void {
    this.params.update((value) => ({
      ...value,
      limit: event.pageSize,
      offset: event.pageIndex * event.pageSize,
    }));
    this.loadList();
  }
}
