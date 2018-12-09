import { WebcamService } from './../shared/services/webcam.service';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-train',
  templateUrl: './train.component.html',
  styleUrls: ['./train.component.scss']
})
export class TrainComponent implements OnInit, AfterViewInit {
  @ViewChild('videoElement') videoElement: ElementRef;
  @ViewChild('sampleElement') sampleElement: ElementRef; 

  videoWidth: number = 224;
  videoHeight: number = 224;

  private video;
  
  constructor(private webcamService: WebcamService) { }

  ngOnInit() {
    this.video = this.videoElement.nativeElement;
  }

  ngAfterViewInit() {
    this.webcamService.setup(this.video);
  }

  snapTrain() {
    const img = this.webcamService.capture(this.video);
    
    this.draw(img, this.sampleElement.nativeElement);
    // this.draw(this.video, this.sampleElement.nativeElement);

    console.log('Draw');
  }

  private draw(image, canvas) {
    const [width, height] = [this.videoWidth, this.videoHeight];
    const ctx = canvas.getContext('2d');
    const imageData = new ImageData(width, height);
    const data = image.dataSync();
    for (let i = 0; i < height * width; ++i) {
      const j = i * 4;
      imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
      imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
      imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
      imageData.data[j + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }
}
