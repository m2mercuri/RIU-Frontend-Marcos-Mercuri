import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Superhero } from '../models/superhero.model';

export interface HeroEvent {
  type: 'created' | 'updated' | 'deleted' | 'selected' | 'error';
  hero?: Superhero;
  heroId?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventBusService {
  private eventSubject = new Subject<HeroEvent>();

  emit(event: HeroEvent): void {
    this.eventSubject.next(event);
  }

  on(): Observable<HeroEvent> {
    return this.eventSubject.asObservable();
  }

  heroCreated(hero: Superhero): void {
    this.emit({
      type: 'created',
      hero,
      message: `Héroe ${hero.name} creado exitosamente`,
    });
  }

  heroUpdated(hero: Superhero): void {
    this.emit({
      type: 'updated',
      hero,
      message: `Héroe ${hero.name} actualizado exitosamente`,
    });
  }

  heroDeleted(heroId: string, heroName: string): void {
    this.emit({
      type: 'deleted',
      heroId,
      message: `Héroe ${heroName} eliminado exitosamente`,
    });
  }

  heroSelected(hero: Superhero): void {
    this.emit({ type: 'selected', hero });
  }
}
