import { TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { SuperheroService } from './superhero.service';
import {
  Superhero,
  SuperheroCreateRequest,
  SuperheroUpdateRequest,
  SuperheroFilter,
} from '../models/superhero.model';

describe('SuperheroService', () => {
  let service: SuperheroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuperheroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHeroes', () => {
    it('should return paginated heroes with default filter', fakeAsync(() => {
      const filter: SuperheroFilter = {
        page: 1,
        pageSize: 10,
      };

      let result: any;
      service.getHeroes(filter).subscribe((response) => {
        result = response;
      });

      tick(1000); // Simular delay de 1000ms

      expect(result).toBeDefined();
      expect(result.heroes).toBeInstanceOf(Array);
      expect(result.heroes.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBeGreaterThan(0);
    }));

    it('should filter heroes by name', fakeAsync(() => {
      const filter: SuperheroFilter = {
        name: 'SUPERMAN',
        page: 1,
        pageSize: 10,
      };

      let result: any;
      service.getHeroes(filter).subscribe((response) => {
        result = response;
      });

      tick(1000);

      expect(result.heroes.length).toBe(1);
      expect(result.heroes[0].name).toBe('SUPERMAN');
    }));
  });

  describe('getHeroById', () => {
    it('should return a hero when ID exists', fakeAsync(() => {
      let result: Superhero | null = null;
      service.getHeroById('1').subscribe((hero) => {
        result = hero;
      });

      tick(300);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      if (result) {
        expect((result as Superhero).id).toBe('1');
        expect((result as Superhero).name).toBe('SUPERMAN');
      }
    }));

    it('should return null when ID does not exist', fakeAsync(() => {
      let result: Superhero | null | undefined;
      service.getHeroById('999').subscribe((hero) => {
        result = hero;
      });

      tick(300);

      expect(result).toBeNull();
    }));
  });

  describe('createHero', () => {
    it('should create a new hero successfully', fakeAsync(() => {
      const newHeroData: SuperheroCreateRequest = {
        name: 'Test Hero',
        realName: 'Test Real Name',
        powers: ['Test Power'],
        city: 'Test City',
        team: 'Test Team',
        description: 'Test Description',
        isActive: true,
      };

      let result: Superhero | undefined;
      service.createHero(newHeroData).subscribe((hero) => {
        result = hero;
      });

      tick(1000);

      expect(result).toBeDefined();
      expect(result?.name).toBe('TEST HERO');
      expect(result?.realName).toBe('Test Real Name');
      expect(result?.id).toBeDefined();
      expect(result?.powers).toEqual(['Test Power']);
    }));

    it('should throw error when hero name already exists', fakeAsync(() => {
      const existingHeroData: SuperheroCreateRequest = {
        name: 'Superman', // Ya existe
        realName: 'Clark Kent',
        powers: ['Test Power'],
        city: 'Test City',
        description: 'Test Description',
        isActive: true,
      };

      let error: any;
      service.createHero(existingHeroData).subscribe({
        next: () => {},
        error: (err) => {
          error = err;
        },
      });

      tick(1000);

      expect(error).toBeDefined();
      expect(error.message).toBe('Ya existe un héroe con ese nombre');
    }));
  });

  describe('updateHero', () => {
    it('should update an existing hero successfully', fakeAsync(() => {
      const updateData: SuperheroUpdateRequest = {
        id: '1',
        name: 'Updated Superman',
        realName: 'Updated Clark Kent',
        powers: ['Updated Power'],
        city: 'Updated City',
        team: 'Updated Team',
        description: 'Updated Description',
        isActive: false,
      };

      let result: Superhero | undefined;
      service.updateHero(updateData).subscribe((hero) => {
        result = hero;
      });

      tick(1000);

      expect(result).toBeDefined();
      expect(result?.name).toBe('UPDATED SUPERMAN');
      expect(result?.realName).toBe('Updated Clark Kent');
      expect(result?.isActive).toBe(false);
    }));

    it('should throw error when hero ID does not exist', fakeAsync(() => {
      const updateData: SuperheroUpdateRequest = {
        id: '999',
        name: 'Non Existent Hero',
        realName: 'Non Existent',
        powers: ['Power'],
        city: 'City',
        description: 'Description',
        isActive: true,
      };

      let error: any;
      service.updateHero(updateData).subscribe({
        next: () => {},
        error: (err) => {
          error = err;
        },
      });

      tick(1000);

      expect(error).toBeDefined();
      expect(error.message).toBe('Superhéroe no encontrado');
    }));
  });

  describe('deleteHero', () => {
    it('should delete an existing hero successfully', fakeAsync(() => {
      const initialCount = service.heroesSignal().length;

      let result: boolean | undefined;
      service.deleteHero('1').subscribe((success) => {
        result = success;
      });

      tick(600);

      expect(result).toBe(true);
      expect(service.heroesSignal().length).toBe(initialCount - 1);
    }));

    it('should throw error when hero ID does not exist', fakeAsync(() => {
      let error: any;
      service.deleteHero('999').subscribe({
        next: () => {},
        error: (err) => {
          error = err;
        },
      });

      tick(600);

      expect(error).toBeDefined();
      expect(error.message).toBe('Superhéroe no encontrado');
    }));
  });
});
