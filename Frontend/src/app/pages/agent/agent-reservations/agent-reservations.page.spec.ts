import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReservationService } from '../../../services/reservation.service';

import { AgentReservationsPage } from './agent-reservations.page';

describe('AgentReservationsPage', () => {
  let component: AgentReservationsPage;
  let fixture: ComponentFixture<AgentReservationsPage>;
  const reservationService = jasmine.createSpyObj<ReservationService>('ReservationService', [
    'getAll',
    'updateState',
    'delete',
  ]);

  beforeEach(async () => {
    reservationService.getAll.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [AgentReservationsPage],
      providers: [{ provide: ReservationService, useValue: reservationService }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentReservationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
