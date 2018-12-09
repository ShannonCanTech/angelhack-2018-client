import { Lounges } from './lounges.model';
import { LoungesService } from './lounges.service';
import { Component, OnInit } from '@angular/core';

import { Position } from '../shared/models/position.model';

@Component({
  selector: 'app-lounges',
  templateUrl: './lounges.component.html',
  styleUrls: ['./lounges.component.scss']
})
export class LoungesComponent implements OnInit {

  currentLocation = new Position();
  lounges: Lounges[] = [];

  constructor(private loungesSerivce: LoungesService) { }

  ngOnInit() {
    // Use seaTac l
    this.currentLocation.long = -122.308924;
    this.currentLocation.lat = 47.450555;

    this.loungesSerivce.getLounges(this.currentLocation.lat, this.currentLocation.long).subscribe(data => {
      data.result.forEach(element => {

        this.lounges.push(element);
      });
    });

  }

}
