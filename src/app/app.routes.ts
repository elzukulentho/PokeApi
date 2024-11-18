import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'home',
        loadComponent: () => import('../app/poke-list/poke-list.component'),
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
