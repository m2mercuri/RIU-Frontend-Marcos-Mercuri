import { Component, inject, Input, input } from '@angular/core';
import { Superhero } from '../../models/superhero.model';
import { LoadingService } from '../../services/loading.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './delete-confirm-modal.component.html',
  styleUrl: './delete-confirm-modal.component.scss',
})
export class DeleteConfirmModalComponent {
  @Input() hero: Superhero | undefined;

  public loadingService = inject(LoadingService);
  public activeModal = inject(NgbActiveModal);
  constructor() {}

  deleteHero() {
    this.activeModal.close(this.hero);
  }
}
