import { Component, OnInit } from '@angular/core';

import { Position } from '../shared/models/position.model';

@Component({
  selector: 'app-atm',
  templateUrl: './atm.component.html',
  styleUrls: ['./atm.component.scss']
})
export class AtmComponent implements OnInit {

  currentLocation = new Position();

  constructor() { }

  ngOnInit() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.currentLocation.long = position.coords.longitude;
        this.currentLocation.lat = position.coords.latitude;
        console.log(this.currentLocation);
      });
    }
  }
}
