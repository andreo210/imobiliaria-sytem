import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteView } from './cliente-view';

describe('ClienteView', () => {
  let component: ClienteView;
  let fixture: ComponentFixture<ClienteView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
