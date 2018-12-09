import * as tf from '@tensorflow/tfjs';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

import { ControllerDatasetService } from './../shared/services/controller-dataset.service';
import { WebcamService } from './../shared/services/webcam.service';

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

  label: number = 0;

  truncatedMobileNet: tf.Model;

  private video;

  constructor(private webcamService: WebcamService, private controllerDatasetService: ControllerDatasetService) { }

  ngOnInit() {
    this.video = this.videoElement.nativeElement;
    this.loadTruncatedMobileNet();
  }

  ngAfterViewInit() {
    this.webcamService.setup(this.video);
  }

  snapTrain() {
    tf.tidy(() => {
      const img = this.webcamService.capture(this.video);
      this.controllerDatasetService.addExample(this.truncatedMobileNet.predict(img), this.label);

      // Draw the preview thumbnail.
      this.draw(img, this.sampleElement.nativeElement);
    });
  }

  // Loads mobilenet and returns a model that returns the internal activation
  // we'll use as input to our classifier model.
  private loadTruncatedMobileNet() {
    tf.loadModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json').then(mobilenet => {
      // Return a model that outputs an internal activation.
      const layer = mobilenet.getLayer('conv_pw_13_relu');
      this.truncatedMobileNet = tf.model({ inputs: mobilenet.inputs, outputs: layer.output });

      // Warm up the model. This uploads weights to the GPU and compiles the WebGL
      // programs so the first time we collect data from the webcam it will be
      // quick.
      tf.tidy(() => this.truncatedMobileNet.predict(this.webcamService.capture(this.video)));
    });
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
