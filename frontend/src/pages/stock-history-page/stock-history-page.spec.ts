import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockHistoryPage } from './stock-history-page';

describe('StockHistoryPage', () => {
  let component: StockHistoryPage;
  let fixture: ComponentFixture<StockHistoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockHistoryPage],
    }).compileComponents();

    fixture = TestBed.createComponent(StockHistoryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
