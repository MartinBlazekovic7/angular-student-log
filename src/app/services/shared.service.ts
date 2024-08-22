import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private sidebarState = new BehaviorSubject<boolean>(false);
  currentSidebarState = this.sidebarState.asObservable();

  changeSidebarState(state: boolean) {
    this.sidebarState.next(state);
  }

  activeSubject = new BehaviorSubject({ active: false });
  active$ = this.activeSubject.asObservable();

  show() {
    this.activeSubject.next({ active: true });
  }

  hide() {
    this.activeSubject.next({ active: false });
  }
}
