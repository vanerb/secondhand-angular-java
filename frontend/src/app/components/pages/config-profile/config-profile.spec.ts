import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigProfile } from './config-profile';

describe('ConfigProfile', () => {
  let component: ConfigProfile;
  let fixture: ComponentFixture<ConfigProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
