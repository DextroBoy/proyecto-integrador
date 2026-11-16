import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
        { provide: EventService, useValue: jasmine.createSpyObj('EventService', ['getByCode']) },
        {
          provide: ReservationService,
          useValue: jasmine.createSpyObj('ReservationService', ['create']),
        },
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
