import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { Observable } from 'rxjs';
import { HistorialService } from './historial.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIconModule,
    MatButtonModule,
    AsyncPipe,
  ],
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.css'
})
export class SearchModalComponent implements OnInit {
  private readonly matDialogRef = inject(MatDialogRef<SearchModalComponent>);
  private readonly historyServe = inject(HistorialService);
  public history$: Observable<string[]> | undefined;

  ngOnInit(): void {
    this.history$ = this.historyServe.history$;
  }

  searchForm = new FormGroup({
    search: new FormControl<string>('', [Validators.required, Validators.minLength(2)])
  });


  search(): void {
    const searchValue = this.searchForm.controls.search.value;
    this.historyServe.addSearchTerm(searchValue!);
    this.matDialogRef.close(searchValue);
  }

  clearHistory(): void {
    this.historyServe.clearHistory(); 
  }

  searchFromHistory(term: string): void {
    this.searchForm.get('search')?.setValue(term); 
    this.search(); 
  }
}
