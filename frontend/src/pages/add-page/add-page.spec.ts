import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddPage } from './add-page';

describe('AddPage', () => {
  let component: AddPage;
  let fixture: ComponentFixture<AddPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
