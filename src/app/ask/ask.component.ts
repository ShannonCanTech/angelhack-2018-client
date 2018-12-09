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

  private video;

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
      setInterval(() => {
        const img = this.webcamService.capture(this.video);

        const predictedClass = this.modelAgentService.predict(img);

        (predictedClass.data() as Promise<any>).then(res => {
          const classId = res[0];
          predictedClass.dispose();

          this.cameraReadOutput = classId;

          tf.nextFrame();
        });
      }, 500);
    }
  }

  getPrediction(): string {
    if (this.cameraReadOutput === 1) {
      return 'You looking for ATM?';
    }

    return 'What are you looking for?';
  }
}
