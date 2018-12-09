import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoungesService {

  private readonly url = 'https://api.discover.com/dci-lounges/v2/lounges';
  private readonly radius = 20;
  private readonly accessToken = environment.accessToken;
  private readonly page = 1;
  private readonly pageSize = 20;
  private readonly sortdir = 'asc';
  private readonly plan = 'DCILOUNGES_SANDBOX';

  constructor(private http: HttpClient) { }

  getLounges(lat: number, long: number): Observable<any> {
    let params = new HttpParams();

    // Begin assigning parameters
    params = params.append('radius', this.radius.toString());
    params = params.append('lng', long.toString());
    params = params.append('lat', lat.toString());
    params = params.append('page', this.page.toString());
    params = params.append('pageSize', this.pageSize.toString());
    params = params.append('sortdir', this.sortdir.toString());

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
