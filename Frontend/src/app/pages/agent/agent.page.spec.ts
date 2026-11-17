import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

import { AgentPage } from './agent.page';

describe('AgentPage', () => {
  let component: AgentPage;
  let fixture: ComponentFixture<AgentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user: () => null, logout: () => undefined } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
