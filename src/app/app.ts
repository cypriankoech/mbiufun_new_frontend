import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class App {
  title = 'MbiuFun - Angular 20';

  constructor() {
    console.log('Angular App component instantiated!');
  }
}
