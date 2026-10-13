import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotFound404 } from './not-found-404-page';

describe('NotFound404', () => {
  let component: NotFound404;
  let fixture: ComponentFixture<NotFound404>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound404],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound404);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
