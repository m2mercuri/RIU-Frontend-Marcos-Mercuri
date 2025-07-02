import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UppercaseDirective } from '../../shared/directives/uppercase.directive';
import { Subject, takeUntil } from 'rxjs';
import {
  Superhero,
  SuperheroCreateRequest,
  SuperheroUpdateRequest,
} from '../../models/superhero.model';
import { EventBusService } from '../../services/event-bus.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SuperheroService } from '../../services/superhero.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-hero-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UppercaseDirective],
  templateUrl: './hero-form.component.html',
  styleUrl: './hero-form.component.scss',
})
export class HeroFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private superheroService = inject(SuperheroService);
  private eventBus = inject(EventBusService);
  private destroy$ = new Subject<void>();

  loadingService = inject(LoadingService);

  heroForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  heroId: string | null = null;

  get powersFormArray() {
    return this.heroForm.get('powers') as FormArray;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.heroForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      realName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      city: ['', [Validators.required, Validators.maxLength(50)]],
      team: ['', [Validators.maxLength(50)]],
      powers: this.fb.array([this.createPowerControl()], [Validators.required]),
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      isActive: [true],
    });
  }

  private createPowerControl() {
    return this.fb.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ]);
  }

  private checkEditMode(): void {
    this.heroId = this.route.snapshot.paramMap.get('id');
    if (this.heroId) {
      this.isEditMode.set(true);
      this.loadHeroData();
    }
  }

  private loadHeroData(): void {
    if (!this.heroId) return;

    this.loadingService.show();

    this.superheroService
      .getHeroById(this.heroId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hero: any) => {
          if (hero) {
            this.populateForm(hero);
          } else {
            this.eventBus.emit({
              type: 'error',
              message: 'Superhéroe no encontrado',
            });
            this.goBack();
          }
          this.loadingService.hide();
        },
        error: (error: any) => {
          console.error('Error loading hero:', error);
          this.eventBus.emit({
            type: 'error',
            message: `Error al cargar el superhéroe`,
          });
          this.goBack();
          this.loadingService.hide();
        },
      });
  }

  private populateForm(hero: Superhero): void {
    // Limpiar el FormArray de poderes
    while (this.powersFormArray.length > 0) {
      this.powersFormArray.removeAt(0);
    }

    // Agregar los poderes del héroe
    hero.powers.forEach((power: any) => {
      this.powersFormArray.push(
        this.fb.control(power, [Validators.required, Validators.minLength(2)])
      );
    });

    // Rellenar el resto del formulario
    this.heroForm.patchValue({
      name: hero.name,
      realName: hero.realName,
      city: hero.city,
      team: hero.team || '',
      description: hero.description,
      isActive: hero.isActive,
    });
  }

  addPower(): void {
    this.powersFormArray.push(this.createPowerControl());
  }

  removePower(index: number): void {
    if (this.powersFormArray.length > 1) {
      this.powersFormArray.removeAt(index);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.heroForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.heroForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  isPowerInvalid(index: number): boolean {
    const power = this.powersFormArray.at(index);
    return !!(power && power.invalid && (power.dirty || power.touched));
  }

  isFormTouched(): boolean {
    return this.heroForm.touched;
  }

  onSubmit(): void {
    if (this.heroForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.heroForm.value;
    const heroData = {
      name: formValue.name,
      realName: formValue.realName,
      city: formValue.city,
      team: formValue.team || undefined,
      powers: formValue.powers.filter((power: string) => power.trim()),
      description: formValue.description,
      isActive: formValue.isActive,
    };

    if (this.isEditMode()) {
      this.updateHero(heroData);
    } else {
      this.createHero(heroData);
    }
  }

  private createHero(heroData: SuperheroCreateRequest): void {
    this.superheroService
      .createHero(heroData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hero: any) => {
          this.eventBus.heroCreated(hero);
          this.router.navigate(['/heroes']);
        },
        error: (error: any) => {
          console.error('Error creating hero:', error);
          this.eventBus.emit({
            type: 'error',
            message: `Error al crear el superhéroe: ${error.message}`,
          });
        },
      });
  }

  private updateHero(heroData: SuperheroCreateRequest): void {
    if (!this.heroId) return;

    const updateData: SuperheroUpdateRequest = {
      ...heroData,
      id: this.heroId,
    };

    this.superheroService
      .updateHero(updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (hero: any) => {
          this.eventBus.heroUpdated(hero);
          this.router.navigate(['/heroes']);
        },
        error: (error: any) => {
          console.error('Error updating hero:', error);
          this.eventBus.emit({
            type: 'error',
            message: `Error al actualizar el superhéroe: ${error.message}`,
          });
        },
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.heroForm.controls).forEach((key) => {
      const control = this.heroForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach((subControl) => subControl.markAsTouched());
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/heroes']);
  }
}
