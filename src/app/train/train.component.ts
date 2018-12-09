import * as tf from '@tensorflow/tfjs';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

import { ControllerDatasetService } from './../shared/services/controller-dataset.service';
import { WebcamService } from './../shared/services/webcam.service';
import { ModelAgentService } from '../shared/services/model-agent.service';

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

  isMouseDown: boolean = false;

  trainDataInterval: NodeJS.Timer;

  // Learning config
  learningRate: number = 0.0001;
  denseUnit: number = 100;
  batchSizeFraction: number = 0.4;
  epoches: number = 20;

  private video;

  constructor(
    private webcamService: WebcamService,
    private controllerDatasetService: ControllerDatasetService,
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
  }

  ngAfterViewInit() {
    this.webcamService.setup(this.video);
  }

  mouseup() {
    if (this.trainDataInterval) {
      clearInterval(this.trainDataInterval);
      this.trainDataInterval = undefined;
    }
  }

  mousedown() {
    if (!this.trainDataInterval) {
      this.addData();
    }
  }

  train() {
    if (this.controllerDatasetService.xs == null) {
      throw new Error('Add some examples before training!');
    }

    // Creates a 2-layer fully connected model. By creating a separate model,
    // rather than adding layers to the mobilenet model, we "freeze" the weights
    // of the mobilenet model, and only train weights from the new model.
    const model = tf.sequential({
      layers: [
        // Flattens the input to a vector so we can use it in a dense layer. While
        // technically a layer, this only performs a reshape (and has no training
        // parameters).
        tf.layers.flatten({
          inputShape: this.modelAgentService.truncatedMobileNet.outputs[0].shape.slice(1)
        }),
        // Layer 1.
        tf.layers.dense({
          units: this.denseUnit,
          activation: 'relu',
          kernelInitializer: 'varianceScaling',
          useBias: true
        }),
        // Layer 2. The number of units of the last layer should correspond
        // to the number of classes we want to predict.
        tf.layers.dense({
          units: this.controllerDatasetService.numberOfClasses,
          kernelInitializer: 'varianceScaling',
          useBias: false,
          activation: 'softmax'
        })
      ]
    });

    // Creates the optimizers which drives training of the model.
    const optimizer = tf.train.adam(this.learningRate);
    // We use categoricalCrossentropy which is the loss function we use for
    // categorical classification which measures the error between our predicted
    // probability distribution over classes (probability that an input is of each
    // class), versus the label (100% probability in the true class)>
    model.compile({ optimizer: optimizer, loss: 'categoricalCrossentropy' });

    // We parameterize batch size as a fraction of the entire dataset because the
    // number of examples that are collected depends on how many examples the user
    // collects. This allows us to have a flexible batch size.
    const batchSize =
      Math.floor(this.controllerDatasetService.xs.shape[0] * this.batchSizeFraction);
    if (!(batchSize > 0)) {
      throw new Error(
        `Batch size is 0 or NaN. Please choose a non-zero fraction.`);
    }

    // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
    model.fit(this.controllerDatasetService.xs, this.controllerDatasetService.ys, {
      batchSize,
      epochs: this.epoches,
      callbacks: {
        onBatchEnd: async (batch, logs) => {
          console.log('Loss: ' + logs.loss.toFixed(5));
          this.modelAgentService.model = model;
        }
      }
    });
  }

  predict() {
    const img = this.webcamService.capture(this.video);

    const predictedClass = this.modelAgentService.predict(img);

    (predictedClass.data() as Promise<any>).then(res => {
      const classId = res[0];
      predictedClass.dispose();

      console.log(classId);

      tf.nextFrame();
    });
  }

  hasTrained() {
    return this.modelAgentService.hasTrained();
  }

  private addData() {
    this.trainDataInterval = setInterval(() => {
      tf.tidy(() => {
        const img = this.webcamService.capture(this.video);
        this.controllerDatasetService.addExample(this.modelAgentService.truncatedMobileNet.predict(img), this.label);

        // Draw the preview thumbnail.
        this.draw(img, this.sampleElement.nativeElement);

        console.log(`training label: ${this.label}`);
      });
    }, 100);
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
