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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.currentLocation.long = position.coords.longitude;
        this.currentLocation.lat = position.coords.latitude;

        this.atmService.getAtmLocations(this.currentLocation.lat, this.currentLocation.long).subscribe(data => {
          data.forEach(element => {
            const position = new Position();
            position.lat = element.latitude;
            position.long = element.longitude;
    
            this.otherLocations.push(position);
          });
        });
      });
    }
  }
}
