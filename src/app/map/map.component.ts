/// <reference types="@types/googlemaps" />

import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  @Input() lat: number;
  @Input() long: number;

  @ViewChild('map') mapElement: ElementRef;

  map: google.maps.Map;

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      let mapProp = {
        center: new google.maps.LatLng(this.lat, this.long),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapProp);

      var marker = new google.maps.Marker({
        title: "You're here",
        label: 'U',
        position: { lat: this.lat, lng: this.long },
        map: this.map
      }
      );
    }, 1000);
  }

}
