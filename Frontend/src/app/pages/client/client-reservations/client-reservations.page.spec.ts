import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReservationService } from '../../../services/reservation.service';

import { ClientReservationsPage } from './client-reservations.page';

describe('ClientReservationsPage', () => {
  let component: ClientReservationsPage;
  let fixture: ComponentFixture<ClientReservationsPage>;
  const reservationService = jasmine.createSpyObj<ReservationService>('ReservationService', [
    'getAll',
    'updateState',
  ]);

  beforeEach(async () => {
    reservationService.getAll.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [ClientReservationsPage],
      providers: [{ provide: ReservationService, useValue: reservationService }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientReservationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
