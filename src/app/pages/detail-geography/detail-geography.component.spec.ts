import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailGeographyComponent } from './detail-geography.component';

describe('DetailGeographyComponent', () => {
  let component: DetailGeographyComponent;
  let fixture: ComponentFixture<DetailGeographyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailGeographyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailGeographyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
