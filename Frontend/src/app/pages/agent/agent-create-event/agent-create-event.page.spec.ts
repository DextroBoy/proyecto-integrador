import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EventService } from '../../../services/event.service';
import { LocationService } from '../../../services/location.service';

import { AgentCreateEventPage } from './agent-create-event.page';

describe('AgentCreateEventPage', () => {
  let component: AgentCreateEventPage;
  let fixture: ComponentFixture<AgentCreateEventPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentCreateEventPage],
      providers: [
        provideRouter([]),
        {
          provide: EventService,
          useValue: {
            getByCode: jasmine.createSpy().and.returnValue(of({})),
            create: jasmine.createSpy().and.returnValue(of({})),
            update: jasmine.createSpy().and.returnValue(of({})),
          },
        },
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
});
