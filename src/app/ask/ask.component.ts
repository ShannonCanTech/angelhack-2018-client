import { ModelAgentService } from './../shared/services/model-agent.service';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

import { WebcamService } from '../shared/services/webcam.service';
import { ControllerDatasetService } from '../shared/services/controller-dataset.service';

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

  state = 0;

  private video;
  private reading: NodeJS.Timer;

  constructor(
    private webcamService: WebcamService,
    private controllerDatasetService: ControllerDatasetService,
    private modelAgentService: ModelAgentService
  ) { }

  ngOnInit() {
    this.video = this.videoElement.nativeElement;

    if (!this.modelAgentService.hasTrained()) {
      console.error('Error !! data is not trained')
    }
  }

  ngAfterViewInit() {
    this.webcamService.setup(this.video);

    if (this.modelAgentService.hasTrained()) {
      this.reading = setInterval(() => {
        const img = this.webcamService.capture(this.video);

        const predictedClass = this.modelAgentService.predict(img);

        (predictedClass.data() as Promise<any>).then(res => {
          const classId = res[0];

          this.cameraReadOutput = classId;

          console.log(`Reading with value ${predictedClass}`);

          predictedClass.dispose();
          this.updateState();

          tf.nextFrame();
        });
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.reading) {
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
  updateState() {
    if (this.cameraReadOutput === 1) {
      this.state = 1;
    }

    if (this.cameraReadOutput === 2) {
      this.state = 2;
    }

    if (this.cameraReadOutput === 3) {
      this.state = 3;
    }
  }
}
