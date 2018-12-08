import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-ask',
  templateUrl: './ask.component.html',
  styleUrls: ['./ask.component.scss']
})
export class AskComponent implements OnInit, AfterViewInit {
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
