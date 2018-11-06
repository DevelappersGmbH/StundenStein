import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {

  constructor(private injector: Injector) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authHeader = this.injector.get(AuthenticationService).getAuthToken();
    let reqHeaders = req.headers;
    reqHeaders = reqHeaders.append('Content-Type', 'application/json');
    reqHeaders = reqHeaders.append('Accept', 'application/json');
    reqHeaders = reqHeaders.append('X-Redmine-API-Key', authHeader);

    const authReq = req.clone({ headers: reqHeaders });

    return next.handle(authReq);
  }
}
