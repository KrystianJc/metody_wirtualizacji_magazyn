import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';



@Component({
  imports: [RouterLink, RouterOutlet, JsonPipe],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
  private http = inject(HttpClient);

}
