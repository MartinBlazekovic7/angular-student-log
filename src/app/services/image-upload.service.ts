import { inject, Injectable } from '@angular/core';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  Storage,
  deleteObject,
} from '@angular/fire/storage';
import { Observable, from, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  storage = inject(Storage);

  uploadImage(image: File, path: string): Observable<string> {
    const storageRef = ref(this.storage, path);
    const uploadTask = from(uploadBytes(storageRef, image));
    return uploadTask.pipe(switchMap((result) => getDownloadURL(result.ref)));
  }

  deleteImage(path: string): Observable<void> {
    const storageRef = ref(this.storage, path);
    const deleteTask = from(deleteObject(storageRef));
    return deleteTask;
  }
}
