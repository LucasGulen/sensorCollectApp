import { Component, OnInit } from '@angular/core';
import {UseCase} from '../../metier/usecase';
import {ModalController} from '@ionic/angular';
import {Storage} from '@ionic/storage';

@Component({
  selector: 'app-modal',
  templateUrl: './modalUsecase.component.html',
  styleUrls: ['./modalUsecase.component.scss'],
})
export class ModalUsecaseComponent implements OnInit {

  useCases: Array<UseCase> = [
    new UseCase(0, 'Driver and passengers travel in same vehicle'),
    new UseCase(1, 'Driver and passengers travel in same vehicle, driver\'s smartphone in his pocket, passenger\'s smartphone moving (playing a game i.e)'),
    new UseCase(4, 'Driver and passengers travel in same vehicle, driver\'s smartphone fixed, passenger\'s smartphone in pocket'),
    new UseCase(2, 'Driver and passengers travel in different vehicles with different trajectories'),
    new UseCase(3, 'Driver and passengers travel in different vehicles, but one following each other'),
    new UseCase(5, 'Driver start travel alone, passengers getting in the car only near destination')
  ];

  selectedUseCase: UseCase;
  initialCheckedId = -1;

  constructor(private storage: Storage, private modalController: ModalController) {
    this.storage.get('selectedUseCaseId').then( res => {
      const idSelected: number = parseInt(res);
      if (idSelected !== -1) {
        this.initialCheckedId = idSelected;
      }
    });
  }

  ngOnInit() {
  }

  radioChecked(event) {
    this.selectedUseCase = event.detail.value;
    this.closeModal();
  }

  closeModal() {
    const modalController: ModalController = this.modalController;
    modalController.dismiss(this.selectedUseCase);
  }
}
