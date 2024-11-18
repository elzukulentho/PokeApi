import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private readonly localStorageKey = 'searchHistory';
  private historySubject: BehaviorSubject<string[]>;
  public history$: Observable<string[]>;

  constructor() {
    const storedHistory = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
    this.historySubject = new BehaviorSubject<string[]>(storedHistory);
    this.history$ = this.historySubject.asObservable();
  }

  addSearchTerm(term: string): void {
    if (!term.trim()) return;
    const currentHistory = this.historySubject.value;
    const updatedHistory = [term, ...currentHistory.filter((t) => t !== term)].slice(0, 10); // Limita a 10 términos
    this.historySubject.next(updatedHistory);
    this.saveToLocalStorage(updatedHistory);
  }

  clearHistory(): void {
    this.historySubject.next([]);
    localStorage.removeItem(this.localStorageKey);
  }

  private saveToLocalStorage(history: string[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(history));
  }

}
