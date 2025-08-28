import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { environment } from '../../../environments/environment';

// Reducers
import { authReducer } from './auth/auth.reducer';

// Effects
import { AuthEffects } from './auth/auth.effects';

// State
import { AppState } from './app.state';

@NgModule({
  imports: [
    // Store configuration
    StoreModule.forRoot<AppState>({
      auth: authReducer,
      // Add other reducers here as they're implemented
    }, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictStateSerialization: true,
        strictActionSerialization: true,
      }
    }),

    // Effects configuration
    EffectsModule.forRoot([
      AuthEffects,
      // Add other effects here as they're implemented
    ]),

    // Router state
    StoreRouterConnectingModule.forRoot(),

    // DevTools (only in development)
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
    }),
  ],
  exports: [
    StoreModule,
    EffectsModule,
    StoreDevtoolsModule,
    StoreRouterConnectingModule,
  ]
})
export class AppStoreModule { }
