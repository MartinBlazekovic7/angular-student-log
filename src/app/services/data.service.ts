import { inject, Injectable } from '@angular/core';
import {
  doc,
  docData,
  Firestore,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { UserProfile } from '../interfaces/user.interface';
import { Collections } from '../enums/collections.enum';
import { MonthDataResponse } from '../interfaces/month-data.interface';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  firestore = inject(Firestore);

  addData(collection: string, data: any): Observable<void> {
    const ref = doc(this.firestore, collection, data.uid);
    return from(setDoc(ref, data));
  }

  getData(collection: string, uid: string) {
    const ref = doc(this.firestore, collection, uid);
    return docData(ref);
  }

  updateUser(user: UserProfile): Observable<void> {
    const ref = doc(this.firestore, Collections.USERS, user.uid ?? '');
    return from(updateDoc(ref, { ...user }));
  }

  removeImage(uid: string): Observable<void> {
    const ref = doc(this.firestore, Collections.USERS, uid);
    return from(updateDoc(ref, { photoURL: '' }));
  }

  getDocument(collection: string, id: string): Observable<any> {
    const ref = doc(this.firestore, collection, id);
    return docData(ref);
  }

  updateUserMonthData(monthData: MonthDataResponse): Observable<void> {
    const ref = doc(this.firestore, Collections.MONTH_DATA, monthData.uid);
    return from(setDoc(ref, monthData));
  }
}
