import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms/src/directives';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable ,  Subscription } from 'rxjs';
import { map, startWith, takeWhile, tap } from 'rxjs/operators';

import { Login, VerifySession } from '../../../store/actions/auth.actions';
import { RouterNav } from '../../../store/actions/router.actions';
import { AppState } from '../../../store/app-state';
import { AuthState } from '../../../store/reducers/auth.reducer';
import { RouterRedirect } from '../../../store/reducers/routing.reducer';
import { EndpointState } from '../../../store/types/endpoint.types';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) { }

  loginForm: NgForm;

  username: string;
  password: string;

  loggedIn: boolean;
  loggingIn: boolean;
  verifying: boolean;
  error: boolean;

  busy$: Observable<boolean>;

  redirect: RouterRedirect;

  message = '';

  subscription: Subscription;

  ngOnInit() {
    this.store.dispatch(new VerifySession());
    const auth$ = this.store.select(s => ({ auth: s.auth, endpoints: s.endpoints }));
    this.busy$ = auth$.pipe(
      map(
        ({ auth, endpoints }) => !auth.error || !(auth.sessionData && auth.sessionData.valid) &&
          (auth.sessionData && auth.sessionData.valid) || auth.verifying || auth.loggingIn || endpoints.loading
      ),
      startWith(true)
    );
    this.subscription =
      auth$
        .pipe(
          tap(({ auth, endpoints }) => {
            this.redirect = auth.redirect;
            this.handleOther(auth, endpoints);
          }),
          takeWhile(({ auth, endpoints }) => {
            const loggedIn = !auth.loggingIn && auth.loggedIn;
            const validSession = auth.sessionData && auth.sessionData.valid;
            return !(loggedIn && validSession);
          }),
      )
        .subscribe(null, null, () => this.handleSuccess());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  login() {
    this.message = '';
    this.store.dispatch(new Login(this.username, this.password));
  }

  private handleSuccess() {
    if (this.subscription) {
      this.subscription.unsubscribe(); // Ensure to unsub otherwise GoToState gets caught in loop
    }
    if (this.redirect) {
      this.store.dispatch(new RouterNav({ path: [this.redirect.path], query: this.redirect.queryParams || {} }));
    } else {
      this.store.dispatch(new RouterNav({ path: ['/'] }, null));
    }
  }

  private handleOther(auth: AuthState, endpoints: EndpointState) {
    this.loggedIn = auth.loggedIn;
    this.loggingIn = auth.loggingIn;
    this.verifying = auth.verifying;

    // Upgrade in progress
    if (auth.sessionData && auth.sessionData.upgradeInProgress) {
      this.subscription.unsubscribe(); // Ensure to unsub otherwise GoToState gets caught in loop
      this.store.dispatch(new RouterNav({ path: ['/upgrade'], extras: { skipLocationChange: true } }));
      return false;
    }

    // Setup mode
    if (auth.sessionData && auth.sessionData.uaaError) {
      this.subscription.unsubscribe(); // Ensure to unsub otherwise GoToState gets caught in loop
      this.store.dispatch(new RouterNav({ path: ['/uaa'] }));
      return false;
    }

    // auth.sessionData will be populated if user has been redirected here after attempting to access a protected page without
    // a valid session
    this.error = auth.error && (!auth.sessionData || !auth.sessionData.valid);

    if (this.error) {
      if (auth.error && auth.errorResponse && auth.errorResponse === 'Invalid session') {
        // Invalid session (redirected after attempting to access a protected page). Don't show any error
        this.message = '';
      } else if (auth.error && auth.errorResponse && auth.errorResponse.status === 401) {
        // User supplied invalid credentials
        this.message = 'Username and password combination incorrect. Please try again.';
      } else {
        // All other errors
        this.message = `Couldn't log in, please try again.`;
      }
    }
  }

}
