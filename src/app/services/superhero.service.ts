import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  Superhero,
  SuperheroCreateRequest,
  SuperheroUpdateRequest,
  SuperheroResponse,
  SuperheroFilter,
} from '../models/superhero.model';

@Injectable({
  providedIn: 'root',
})
export class SuperheroService {
  private heroes = signal<Superhero[]>([]);

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    const initialHeroes: Superhero[] = [
      {
        id: '1',
        name: 'SUPERMAN',
        realName: 'Clark Kent',
        powers: [
          'Vuelo',
          'Superfuerza',
          'Visión de rayos X',
          'Invulnerabilidad',
        ],
        city: 'Metropolis',
        team: 'Liga de la Justicia',
        description: 'El Hombre de Acero, defensor de la Tierra.',
        isActive: true,
      },
      {
        id: '2',
        name: 'BATMAN',
        realName: 'Bruce Wayne',
        powers: [
          'Inteligencia superior',
          'Artes marciales',
          'Tecnología avanzada',
        ],
        city: 'Gotham City',
        team: 'Liga de la Justicia',
        description: 'El Caballero Oscuro de Gotham.',
        isActive: true,
      },
      {
        id: '3',
        name: 'SPIDERMAN',
        realName: 'Peter Parker',
        powers: ['Sentido arácnido', 'Superfuerza', 'Agilidad', 'Telarañas'],
        city: 'New York',
        team: 'Vengadores',
        description: 'Su amigable vecino Spiderman.',
        isActive: true,
      },
      {
        id: '4',
        name: 'WONDER WOMAN',
        realName: 'Diana Prince',
        powers: [
          'Superfuerza',
          'Vuelo',
          'Lazo de la verdad',
          'Escudo indestructible',
        ],
        city: 'Washington DC',
        team: 'Liga de la Justicia',
        description: 'Princesa amazona y defensora de la justicia.',
        isActive: true,
      },
      {
        id: '5',
        name: 'MANOLITO EL FUERTE',
        realName: 'Manuel García',
        powers: ['Superfuerza', 'Resistencia'],
        city: 'Madrid',
        team: 'Héroes Ibéricos',
        description: 'El héroe más fuerte de España.',
        isActive: true,
      },
    ];

    this.heroes.set(initialHeroes);
  }

  getHeroes(filter: SuperheroFilter): Observable<SuperheroResponse> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        let filteredHeroes = [...this.heroes()];

        if (filter.name) {
          const searchTerm = filter.name.toLowerCase();
          filteredHeroes = filteredHeroes.filter((hero) =>
            hero.name.toLowerCase().includes(searchTerm)
          );
        }

        if (filter.isActive !== undefined) {
          filteredHeroes = filteredHeroes.filter(
            (hero) => hero.isActive === filter.isActive
          );
        }

        const total = filteredHeroes.length;
        const totalPages = Math.ceil(total / filter.pageSize);
        const startIndex = (filter.page - 1) * filter.pageSize;
        const endIndex = startIndex + filter.pageSize;
        const paginatedHeroes = filteredHeroes.slice(startIndex, endIndex);

        return {
          heroes: paginatedHeroes,
          total,
          page: filter.page,
          pageSize: filter.pageSize,
          totalPages,
        };
      })
    );
  }

  getHeroById(id: string): Observable<Superhero | null> {
    return of(null).pipe(
      delay(300),
      map(() => {
        const hero = this.heroes().find((h) => h.id === id);
        return hero || null;
      })
    );
  }

  createHero(heroData: SuperheroCreateRequest): Observable<Superhero> {
    return of(null).pipe(
      delay(1000),
      switchMap(() => {
        const existingHero = this.heroes().find(
          (h) => h.name.toLowerCase() === heroData.name.toLowerCase()
        );

        if (existingHero) {
          return throwError(
            () => new Error('Ya existe un héroe con ese nombre')
          );
        }

        const newHero: Superhero = {
          ...heroData,
          id: new Date().getTime().toString(),
          name: heroData.name.toUpperCase(),
        };

        const currentHeroes = this.heroes();
        this.heroes.set([...currentHeroes, newHero]);

        return of(newHero);
      })
    );
  }

  updateHero(heroData: SuperheroUpdateRequest): Observable<Superhero> {
    return of(null).pipe(
      delay(1000),
      switchMap(() => {
        const currentHeroes = this.heroes();
        const heroIndex = currentHeroes.findIndex((h) => h.id === heroData.id);

        if (heroIndex === -1) {
          return throwError(() => new Error('Superhéroe no encontrado'));
        }

        const existingHero = currentHeroes.find(
          (h) =>
            h.id !== heroData.id &&
            h.name.toLowerCase() === heroData.name.toLowerCase()
        );

        if (existingHero) {
          return throwError(
            () => new Error('Ya existe un héroe con ese nombre')
          );
        }

        const updatedHero: Superhero = {
          ...currentHeroes[heroIndex],
          ...heroData,
          name: heroData.name.toUpperCase(),
        };

        const updatedHeroes = [...currentHeroes];
        updatedHeroes[heroIndex] = updatedHero;
        this.heroes.set(updatedHeroes);

        return of(updatedHero);
      })
    );
  }

  deleteHero(id: string): Observable<boolean> {
    return of(null).pipe(
      delay(600),
      switchMap(() => {
        const currentHeroes = this.heroes();
        const heroExists = currentHeroes.some((h) => h.id === id);

        if (!heroExists) {
          return throwError(() => new Error('Superhéroe no encontrado'));
        }

        const filteredHeroes = currentHeroes.filter((h) => h.id !== id);
        this.heroes.set(filteredHeroes);

        return of(true);
      })
    );
  }

  get heroesSignal() {
    return this.heroes.asReadonly();
  }
}
