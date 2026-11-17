import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPage } from './admin.page';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

describe('AdminPage', () => {
  let component: AdminPage;
  let fixture: ComponentFixture<AdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPage],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: { user: () => null, logout: () => undefined } },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
