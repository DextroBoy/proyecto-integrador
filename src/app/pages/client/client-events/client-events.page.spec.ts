import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ClientEventsPage } from './client-events.page';

describe('ClientEventsPage', () => {
  let component: ClientEventsPage;
  let fixture: ComponentFixture<ClientEventsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientEventsPage],
      providers: [provideRouter([])],
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
