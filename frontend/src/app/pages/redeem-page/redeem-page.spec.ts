import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RedeemPage } from './redeem-page';

describe('RedeemPage', () => {
  let component: RedeemPage;
  let fixture: ComponentFixture<RedeemPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedeemPage],
    }).compileComponents();

    fixture = TestBed.createComponent(RedeemPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
