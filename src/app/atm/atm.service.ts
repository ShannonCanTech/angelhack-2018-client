import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { environment } from './../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AtmService {

  private readonly url = 'https://api.discover.com/dci/atm/v1/locations';
  private readonly radius = 5;
  private readonly accessToken = environment.accessToken;
  private readonly plan = 'DCI_ATM_SANDBOX';

  constructor(private http: HttpClient) { }

  getAtmLocations(lat: number, long: number): Observable<any> {
    let params = new HttpParams();

    // Begin assigning parameters
    params = params.append('radius', this.radius.toString());
    params = params.append('longitude', long.toString());
    params = params.append('latitude', lat.toString());

    let headers = new HttpHeaders({
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
      'x-dfs-api-plan': this.plan
    });

    return this.http.get(this.url, {
      headers,
      params
    });
  }
}
