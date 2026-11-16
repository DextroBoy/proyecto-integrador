import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { EventService } from '../../../services/event.service';

import { ClientEventsPage } from './client-events.page';

describe('ClientEventsPage', () => {
  let component: ClientEventsPage;
  let fixture: ComponentFixture<ClientEventsPage>;
  const eventService = jasmine.createSpyObj('EventService', ['getAll']);

  beforeEach(async () => {
    eventService.getAll.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [ClientEventsPage],
      providers: [
        provideRouter([]),
        { provide: EventService, useValue: eventService },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientEventsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
