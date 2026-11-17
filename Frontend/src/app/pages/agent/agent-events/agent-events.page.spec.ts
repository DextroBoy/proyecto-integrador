import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EventService } from '../../../services/event.service';

import { AgentEventsPage } from './agent-events.page';

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
});
