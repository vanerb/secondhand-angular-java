import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChipCategory } from './chip-category';

describe('ChipCategory', () => {
  let component: ChipCategory;
  let fixture: ComponentFixture<ChipCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipCategory],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipCategory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
