import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EventService } from '../../../services/event.service';
import { ReservationService } from '../../../services/reservation.service';

import { ClientCreateReservationPage } from './client-create-reservation.page';

describe('ClientCreateReservationPage', () => {
  let component: ClientCreateReservationPage;
  let fixture: ComponentFixture<ClientCreateReservationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientCreateReservationPage],
      providers: [
        provideRouter([]),
        {
          provide: EventService,
          useValue: { getByCode: jasmine.createSpy().and.returnValue(of(null)) },
        },
        { provide: ReservationService, useValue: { create: jasmine.createSpy() } },
      ],
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
