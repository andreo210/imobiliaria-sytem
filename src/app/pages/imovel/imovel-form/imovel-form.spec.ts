import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImovelFormComponent } from './imovel-form';

describe('ImovelForm', () => {
  let component: ImovelFormComponent;
  let fixture: ComponentFixture<ImovelFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImovelFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImovelFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
