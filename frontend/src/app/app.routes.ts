import { Routes } from '@angular/router';
import { AddPage } from '../pages/add-page/add-page';
import { MainPage } from '../pages/main-page/main-page';
import { NotFound404 } from '../pages/not-found-404-page/not-found-404-page';

export const routes: Routes = [
  { path: '', redirectTo: 'main-page', pathMatch:'full' },
  { path: 'main-page', component: MainPage },
  { path: 'add', component: AddPage },
  { path: '**', component: NotFound404 },
];
