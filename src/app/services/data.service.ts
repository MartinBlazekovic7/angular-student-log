import { inject, Injectable } from '@angular/core';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

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
}
