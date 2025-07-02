import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Superhero, SuperheroFilter } from '../../models/superhero.model';
import { LoadingService } from '../../services/loading.service';
import { EventBusService } from '../../services/event-bus.service';
import { SuperheroService } from '../../services/superhero.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteConfirmModalComponent } from '../../shared/delete-confirm-modal/delete-confirm-modal.component';

@Component({
  selector: 'app-hero-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero-list.component.html',
  styleUrl: './hero-list.component.scss',
})
export class HeroListComponent {
  private superheroService = inject(SuperheroService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  public modalService = inject(NgbModal);
  loadingService = inject(LoadingService);
  private eventBus = inject(EventBusService);

  // Signals
  heroes = signal<Superhero[]>([]);
  totalHeroes = signal<number>(0);
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);

  // Filtros
  searchTerm = '';
  statusFilter = '';
  pageSize = 10;

  // Modal
  heroToDelete: Superhero | null = null;

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    const startPage = Math.max(1, current - 2);
    const endPage = Math.min(total, current + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  });

  startRecord = computed(() => {
    return (this.currentPage() - 1) * this.pageSize + 1;
  });

  endRecord = computed(() => {
    const end = this.currentPage() * this.pageSize;
    return Math.min(end, this.totalHeroes());
  });

  ngOnInit(): void {
    this.setupSearch();
    this.loadHeroes();
    this.listenToEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage.set(1);
        this.loadHeroes();
      });
  }

  private listenToEvents(): void {
    this.eventBus
      .on()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (['created', 'updated', 'deleted'].includes(event.type)) {
          this.loadHeroes();
        }
      });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadHeroes();
  }

  onPageSizeChange(): void {
    this.currentPage.set(1);
    this.loadHeroes();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadHeroes();
    }
  }

  private loadHeroes(): void {
    const filter: SuperheroFilter = {
      page: this.currentPage(),
      pageSize: this.pageSize,
      name: this.searchTerm || undefined,
      isActive: this.statusFilter ? this.statusFilter === 'true' : undefined,
    };

    this.loadingService.show();

    this.superheroService
      .getHeroes(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.heroes.set(response.heroes);
          this.totalHeroes.set(response.total);
          this.totalPages.set(response.totalPages);
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Error loading heroes:', error);
          this.loadingService.hide();
        },
      });
  }

  navigateToAdd(): void {
    this.router.navigate(['/heroes/add']);
  }

  viewHero(hero: Superhero): void {
    this.eventBus.heroSelected(hero);
    this.router.navigate(['/heroes', hero.id]);
  }

  editHero(hero: Superhero): void {
    this.router.navigate(['/heroes/edit', hero.id]);
  }

  confirmDelete(hero: Superhero): void {
    this.heroToDelete = hero;
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur();
    const modalRef = this.modalService.open(DeleteConfirmModalComponent);
    modalRef.componentInstance.hero = hero;
    modalRef.result.then((result) => {
      if (result) {
        this.deleteHero();
      }
    });
  }

  deleteHero(): void {
    if (!this.heroToDelete) return;

    const heroName = this.heroToDelete.name;
    const heroId = this.heroToDelete.id;

    this.superheroService
      .deleteHero(heroId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.eventBus.heroDeleted(heroId, heroName);

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

          this.heroToDelete = null;

          if (this.heroes().length === 1 && this.currentPage() > 1) {
            this.currentPage.set(this.currentPage() - 1);
          }

          this.loadHeroes();
        },
        error: (error) => {
          console.error('Error deleting hero:', error);
          this.eventBus.emit({
            type: 'error',
            message: `Error al eliminar el superhéroe ${heroName}: ${error.message}`,
          });
        },
      });
  }
}
