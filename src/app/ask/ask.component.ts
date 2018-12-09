import { ModelAgentService } from './../shared/services/model-agent.service';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

import { WebcamService } from '../shared/services/webcam.service';
import { Router } from '@angular/router';
import { input } from '@tensorflow/tfjs';

enum INPUT {
  ATM = 0,
  LOUNGES = 2,
  YES = 1,
  NOTHING = 3
}

@Component({
  selector: 'app-ask',
  templateUrl: './ask.component.html',
  styleUrls: ['./ask.component.scss']
})
export class AskComponent implements OnInit, AfterViewInit {
  @ViewChild('videoElement') videoElement: ElementRef;

  videoWidth: number = 224;
  videoHeight: number = 224;

  truncatedMobileNet: tf.Model;

  cameraReadOutput: number = 0;

  inputs = {
    atm: 0,
    yes: 1,
    lounges: 2,
    nothing: 3
  }

  state = this.inputs.nothing;
  started = false;

  private video;
  private reading: NodeJS.Timer;

  constructor(
    private webcamService: WebcamService,
    private router: Router,
    private modelAgentService: ModelAgentService
  ) { }

  ngOnInit() {
    this.video = this.videoElement.nativeElement;

    if (!this.modelAgentService.truncatedMobileNet) {
      this.modelAgentService.loadTruncatedMobileNet().then(res => {
        // Warm up the model. This uploads weights to the GPU and compiles the WebGL
        // programs so the first time we collect data from the webcam it will be
        // quick.
        tf.tidy(() => this.modelAgentService.truncatedMobileNet.predict(this.webcamService.capture(this.video)));
      });
    }

    if (!this.modelAgentService.hasTrained()) {
      console.error('Error !! data is not trained')
    }
  }

  ngAfterViewInit() {
    this.webcamService.setup(this.video);
  }

  start() {
    if (this.modelAgentService.hasTrained()) {
      this.started = true;

      this.reading = setInterval(() => {
        const img = this.webcamService.capture(this.video);

        const predictedClass = this.modelAgentService.predict(img);

        (predictedClass.data() as Promise<any>).then(res => {
          const classId = res[0];

          this.cameraReadOutput = classId;

          console.log(`Reading with value ${predictedClass}`);

          predictedClass.dispose();
          this.processInput();

          tf.nextFrame();
        });
      }, 1000);
    }
  }

  isReady(): boolean {
    return this.modelAgentService.hasTrained();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.reading) {
      clearInterval(this.reading);
    }
  }

  getPrediction(): string {
    if (this.cameraReadOutput === 1) {
      return 'You looking for ATM?';
    }

    return 'What are you looking for?';
  }

  /**
   * Dirty and quick way to update state, only 1-3
   */
  processInput() {
    if (this.cameraReadOutput === this.inputs.atm) {
      this.state = this.inputs.atm;
    }

    if (this.cameraReadOutput === this.inputs.lounges) {
      this.state = this.inputs.lounges;
    }

    if (this.cameraReadOutput === this.inputs.yes) {
      if (this.state === this.inputs.atm) {
        this.router.navigate(['/atm']);
      }

      if (this.state === this.inputs.lounges) {
        this.router.navigate(['/lounges']);
      }
    }
  }
}
