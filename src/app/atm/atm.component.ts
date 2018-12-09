import { Component, OnInit } from '@angular/core';

import { Position } from '../shared/models/position.model';
import { AtmService } from './atm.service';

@Component({
  selector: 'app-atm',
  templateUrl: './atm.component.html',
  styleUrls: ['./atm.component.scss']
})
export class AtmComponent implements OnInit {

  currentLocation = new Position();
  otherLocations: Position[] = [];

  constructor(private atmService: AtmService) { }

  ngOnInit() {

    this.currentLocation.long = -122.344385;
    this.currentLocation.lat = 47.632504;

    this.atmService.getAtmLocations(this.currentLocation.lat, this.currentLocation.long).subscribe(data => {
      data.forEach(element => {
        const position = new Position();
        position.lat = element.latitude;
        position.long = element.longitude;

        this.otherLocations.push(position);
      });
    });
  }
}
