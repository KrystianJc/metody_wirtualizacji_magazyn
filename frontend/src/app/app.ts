import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
  private http = inject(HttpClient); 

  backendData: any; 

  apiUrl = '/api/check'; 

  ngOnInit() {
    this.http.get(this.apiUrl).subscribe({
      next: (data) => {
        this.backendData = data;
        console.log('Dane pobrane pomyślnie przez Proxy!', data);
      },
      error: (err) => {
        console.error('Coś poszło nie tak z proxy:', err);
      }
    });
  }
}
