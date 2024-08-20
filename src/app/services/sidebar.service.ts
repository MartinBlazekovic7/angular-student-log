import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private sidebarState = new BehaviorSubject<boolean>(false);
  currentSidebarState = this.sidebarState.asObservable();

  constructor() {}

  changeSidebarState(state: boolean) {
    this.sidebarState.next(state);
  }
}
