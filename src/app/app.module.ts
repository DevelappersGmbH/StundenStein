import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthenticationService } from './services/authentication/authentication.service';
import { AuthGuard } from './services/authguard/authguard.service';
import { AuthInterceptor } from './services/authguard/auth.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataService } from './services/data/data.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { LoginRoutingModule } from './components/login/login-routing.module';
import { MainComponent } from './components/main/main.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatToolbarModule,
  MatListModule,
  MatSelectModule,
  MatCheckboxModule,
  MatSlideToggleModule,
  MatAutocompleteModule
  } from '@angular/material';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NgModule } from '@angular/core';
import { UserService } from './services/user/user.service';
import { RecentTimeLogsComponent } from './components/recent-time-logs/recent-time-logs.component';
import { TimeTrackerComponent } from './components/time-tracker/time-tracker.component';
import { UserreportsComponent } from './components/userreports/userreports.component';

@NgModule({
  
  declarations: [AppComponent, LoginComponent, MainComponent, NavbarComponent, TimeTrackerComponent, RecentTimeLogsComponent, UserreportsComponent],

  imports: [
    BrowserModule,
    AppRoutingModule,
    LoginRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    ScrollingModule,
    CdkTableModule,
    CdkTreeModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthenticationService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    DataService,
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
