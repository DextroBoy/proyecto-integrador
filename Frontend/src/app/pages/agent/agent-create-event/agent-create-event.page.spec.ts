import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Event } from '../../../interfaces/event.interface';
import { EventService } from '../../../services/event.service';
import { LocationService } from '../../../services/location.service';

import { AgentCreateEventPage } from './agent-create-event.page';

describe('AgentCreateEventPage', () => {
  let component: AgentCreateEventPage;
  let fixture: ComponentFixture<AgentCreateEventPage>;
  let eventService: jasmine.SpyObj<EventService>;

  beforeEach(async () => {
    eventService = jasmine.createSpyObj<EventService>('EventService', ['getByCode', 'create', 'update']);
    eventService.getByCode.and.returnValue(of({} as Event));
    eventService.create.and.returnValue(of({} as Event));
    eventService.update.and.returnValue(of({} as Event));

    await TestBed.configureTestingModule({
      imports: [AgentCreateEventPage],
      providers: [
        provideRouter([]),
        { provide: EventService, useValue: eventService },
        {
          provide: LocationService,
          useValue: { getCountries: jasmine.createSpy().and.returnValue(of([])) },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentCreateEventPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('returns to the registered events list after a successful create', () => {
    const savedEvent: Event = {
      codigo: 5,
      identificacion: 10,
      id_ciudad: 1,
      nombre: 'Nuevo evento',
      descripcion: null,
      teatro: 'Teatro Central',
      ciudad: 'Cali',
      fecha_inicio: new Date('2026-11-20T12:00:00'),
      fecha_fin: new Date('2026-11-20T12:00:00'),
      capacidad: 100,
      precio: 120000,
      observaciones: null,
      estado: 'Programado',
    };
    eventService.create.and.returnValue(of(savedEvent));
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.returnValue(Promise.resolve(true));
    component.selectedCityId = 1;

    component.saveEvent();

    expect(navigate).toHaveBeenCalledWith(
      ['/agent/events'],
      { state: { eventMessage: 'El evento se creó correctamente.' } },
    );
  });
});
