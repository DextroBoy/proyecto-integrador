import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EventService } from '../../../services/event.service';

import { AgentEventsPage } from './agent-events.page';

registerLocaleData(localeEsCo, 'es-CO');

describe('AgentEventsPage', () => {
  let component: AgentEventsPage;
  let fixture: ComponentFixture<AgentEventsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentEventsPage],
      providers: [
        provideRouter([]),
        {
          provide: EventService,
          useValue: {
            getAll: jasmine.createSpy().and.returnValue(of([])),
            delete: jasmine.createSpy().and.returnValue(of(undefined)),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentEventsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one visible edit/delete pair for each event', () => {
    component.events = [
      {
        codigo: 1,
        identificacion: 10,
        id_ciudad: 1,
        nombre: 'Concierto',
        descripcion: null,
        teatro: 'Teatro Central',
        ciudad: 'Cali',
        fecha_inicio: new Date('2026-11-20T12:00:00'),
        fecha_fin: new Date('2026-11-20T12:00:00'),
        capacidad: 100,
        precio: 120000,
        observaciones: null,
        estado: 'Programado',
      },
      {
        codigo: 2,
        identificacion: 10,
        id_ciudad: 1,
        nombre: 'Festival',
        descripcion: null,
        teatro: 'Arena',
        ciudad: 'Cali',
        fecha_inicio: new Date('2026-12-10T12:00:00'),
        fecha_fin: new Date('2026-12-10T12:00:00'),
        capacidad: 200,
        precio: 90000,
        observaciones: null,
        estado: 'En Boleteria',
      },
    ];

    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    for (const row of Array.from(rows) as HTMLTableRowElement[]) {
      expect(row.textContent).toContain('Editar');
      expect(row.textContent).toContain('Eliminar');
      expect(row.querySelectorAll('.event-actions .btn').length).toBe(2);
    }
  });
});
