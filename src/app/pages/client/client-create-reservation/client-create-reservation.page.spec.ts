import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ClientCreateReservationPage } from './client-create-reservation.page';

describe('ClientCreateReservationPage', () => {
  let component: ClientCreateReservationPage;
  let fixture: ComponentFixture<ClientCreateReservationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientCreateReservationPage],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientCreateReservationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
