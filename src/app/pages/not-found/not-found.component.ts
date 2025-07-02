import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { SuperheroNotFoundMessage } from '../../models/superhero.model';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  private router = inject(Router);

  @Input() notFoundMessage: SuperheroNotFoundMessage = {
    title: '404',
    description: 'La página que buscas no existe',
  };

  goBack(): void {
    this.router.navigate(['/heroes']);
  }
}
