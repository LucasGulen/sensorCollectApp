import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalUsecaseComponent } from './modalUsecase.component';

describe('ModalComponent', () => {
  let component: ModalUsecaseComponent;
  let fixture: ComponentFixture<ModalUsecaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalUsecaseComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalUsecaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
