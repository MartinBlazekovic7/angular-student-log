import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { routes } from './app.routes';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory,
      })
    ),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'student-log-app-4ffef',
        appId: '1:727835854105:web:57055454ca9dc832ee7188',
        storageBucket: 'student-log-app-4ffef.appspot.com',
        apiKey: 'AIzaSyC2X4kdmMN7t1xIpdnbxm4HKMJZTjmyEc8',
        authDomain: 'student-log-app-4ffef.firebaseapp.com',
        messagingSenderId: '727835854105',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
