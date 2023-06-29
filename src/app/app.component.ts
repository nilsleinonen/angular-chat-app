import { Component } from '@angular/core';
import { AuthService } from './features/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'get-stream-io-draft';
  constructor(public auth: AuthService, private router: Router) {}

  signOut() {
    this.auth.signOut().subscribe({
      next: () => this.router.navigate(['signin']),
    });
  }
}
