import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-train',
  templateUrl: './train.component.html',
  styleUrls: ['./train.component.scss']
})
export class TrainComponent implements OnInit, AfterViewInit {
  @ViewChild('videoElement') videoElement: ElementRef;  
  
  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    var browser = navigator;

    browser.getUserMedia = (browser.getUserMedia);

    const video = this.videoElement.nativeElement;
    const config = { video: true, audio: false };

    browser.mediaDevices.getUserMedia(config).then(stream => {
      video.src = window.URL.createObjectURL(stream);
      video.play();
    });
  }
}
