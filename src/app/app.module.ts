import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthenticationService } from './services/authentication/authentication.service';
import { AuthGuard } from './services/authguard/authguard.service';
import { AuthInterceptor } from './services/authguard/auth.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule, Title } from '@angular/platform-browser';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DataService } from './services/data/data.service';
import { DeleteWarningComponent } from './components/delete-warning/delete-warning.component';
import { EnforcedInputsDirective } from './directives/enforced-inputs.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { LoginRoutingModule } from './components/login/login-routing.module';
import { MainComponent } from './components/main/main.component';
import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatToolbarModule
  } from '@angular/material';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NgModule } from '@angular/core';
import { RecentTimeLogsComponent } from './components/recent-time-logs/recent-time-logs.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TimeLogComponent } from './components/timelog/timelog.component';
import { TimeTrackerComponent } from './components/time-tracker/time-tracker.component';
import { UserReportsComponent } from './components/userreports/userreports.component';
import { UserService } from './services/user/user.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    NavbarComponent,
    TimeLogComponent,
    TimeTrackerComponent,
    UserReportsComponent,
    RecentTimeLogsComponent,
    DeleteWarningComponent,
    EnforcedInputsDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LoginRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
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
    ReactiveFormsModule,
    MatDialogModule,
    MatBadgeModule
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
    Title,
    UserService
  ],
  bootstrap: [AppComponent],
  entryComponents: [DeleteWarningComponent]
})
export class AppModule {}
