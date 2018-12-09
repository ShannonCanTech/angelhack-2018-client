/// <reference types="@types/googlemaps" />

import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';

import { Position } from '../shared/models/position.model';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  @Input() currentLocation: Position;
  @Input() otherLocations: Position[];

  @ViewChild('map') mapElement: ElementRef;

  map: google.maps.Map;

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      let mapProp = {
        center: new google.maps.LatLng(this.currentLocation.lat, this.currentLocation.long),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapProp);

      var marker = new google.maps.Marker({
        title: "You're here",
        label: 'U',
        position: { lat: this.currentLocation.lat, lng: this.currentLocation.long },
        map: this.map
      });

      this.otherLocations.forEach(location => {
        new google.maps.Marker({
          position: { lat: location.lat, lng: location.long },
          map: this.map
        });
      });
    }, 2000);
  }

}
