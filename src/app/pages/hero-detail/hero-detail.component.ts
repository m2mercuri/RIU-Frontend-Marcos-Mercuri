import { Component, inject, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  Superhero,
  SuperheroNotFoundMessage,
} from '../../models/superhero.model';
import { EventBusService } from '../../services/event-bus.service';
import { SuperheroService } from '../../services/superhero.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '../../services/loading.service';
import { CommonModule } from '@angular/common';
import { DeleteConfirmModalComponent } from '../../shared/delete-confirm-modal/delete-confirm-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotFoundComponent } from '../not-found/not-found.component';

@Component({
  selector: 'app-hero-detail',
  standalone: true,
  imports: [CommonModule, NotFoundComponent],
  templateUrl: './hero-detail.component.html',
  styleUrl: './hero-detail.component.scss',
})
export class HeroDetailComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private superheroService = inject(SuperheroService);
  public modalService = inject(NgbModal);
  private eventBus = inject(EventBusService);
  private destroy$ = new Subject<void>();

  loadingService = inject(LoadingService);

  hero = signal<Superhero | null>(null);
  heroId: string | null = null;

  notFoundMessage: SuperheroNotFoundMessage = {
    title: 'Superhéroe no encontrado',
    description: 'El superhéroe que buscas no existe o ha sido eliminado.',
  };

  ngOnInit(): void {
    this.heroId = this.route.snapshot.paramMap.get('id');
    if (this.heroId) {
      this.loadHero();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadHero(): void {
    if (!this.heroId) return;

    this.loadingService.show();

    this.superheroService
      .getHeroById(this.heroId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hero: any) => {
          this.hero.set(hero);
          this.loadingService.hide();
        },
        error: (error: any) => {
          console.error('Error loading hero:', error);
          this.hero.set(null);
          this.loadingService.hide();
        },
      });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  editHero(): void {
    const hero = this.hero();
    if (hero) {
      this.router.navigate(['/heroes/edit', hero.id]);
    }
  }

  confirmDelete(): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur();
    const modalRef = this.modalService.open(DeleteConfirmModalComponent);
    modalRef.componentInstance.hero = this.hero();
    modalRef.result.then((result: any) => {
      if (result) {
        this.deleteHero();
      }
    });
  }

  deleteHero(): void {
    const hero = this.hero();
    if (!hero) return;

    this.superheroService
      .deleteHero(hero.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.eventBus.heroDeleted(hero.id, hero.name);

          // Cerrar modal
          const modalElement = document.getElementById('deleteModal');
          if (modalElement) {
            const modal = (window as any).bootstrap.Modal.getInstance(
              modalElement
            );
            if (modal) {
              modal.hide();
            }
          }

          // Navegar de vuelta
          this.router.navigate(['/heroes']);
        },
        error: (error: any) => {
          console.error('Error deleting hero:', error);
          this.eventBus.emit({
            type: 'error',
            message: `Error al eliminar el superhéroe ${hero.name}: ${error.message}`,
          });
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/heroes']);
  }
}
