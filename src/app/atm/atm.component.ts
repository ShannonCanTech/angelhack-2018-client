import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-atm',
  templateUrl: './atm.component.html',
  styleUrls: ['./atm.component.scss']
})
export class AtmComponent implements OnInit {

  lat: number;
  long: number;

  constructor() { }

  ngOnInit() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.long = position.coords.longitude;
        this.lat = position.coords.latitude;
      });
    }
  }
}
