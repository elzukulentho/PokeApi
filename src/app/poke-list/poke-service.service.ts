import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataResult, PokemonInfo } from './interfaces/pokemon.interface';

type Params = {
  offset: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class PokeServiceService {
  private readonly httpClient = inject(HttpClient);

  private baseUrl: string = 'https://pokeapi.co/api/v2/pokemon';

  getPokeList(params?: Params): Observable<DataResult> {
    return this.httpClient.get<DataResult>(`${this.baseUrl}`, { params });
  }

  searchPokemon(searchValue: string): Observable<PokemonInfo> {
    return this.httpClient.get<PokemonInfo>(`${this.baseUrl}/${searchValue.toLowerCase()}`);
  }
}
