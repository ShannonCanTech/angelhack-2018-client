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

  isMouseDown: boolean = false;

  trainDataInterval: NodeJS.Timer;

  model: any;

  // Learning config
  learningRate: number = 0.0001;
  denseUnit: number = 100;
  batchSizeFraction: number = 0.4;
  epoches: number = 20;

  private video;

  constructor(private webcamService: WebcamService, private controllerDatasetService: ControllerDatasetService) { }

  ngOnInit() {
    this.video = this.videoElement.nativeElement;
    this.loadTruncatedMobileNet();
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
    this.model = tf.sequential({
      layers: [
        // Flattens the input to a vector so we can use it in a dense layer. While
        // technically a layer, this only performs a reshape (and has no training
        // parameters).
        tf.layers.flatten({
          inputShape: this.truncatedMobileNet.outputs[0].shape.slice(1)
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
    this.model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});
  
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
    this.model.fit(this.controllerDatasetService.xs, this.controllerDatasetService.ys, {
      batchSize,
      epochs: this.epoches,
      callbacks: {
        onBatchEnd: async (batch, logs) => {
          console.log('Loss: ' + logs.loss.toFixed(5));
        }
      }
    });
  }

  predict() {
    const predictedClass = tf.tidy(() => {
      // Capture the frame from the webcam.
      const img = this.webcamService.capture(this.video);

      // Make a prediction through mobilenet, getting the internal activation of
      // the mobilenet model, i.e., "embeddings" of the input images.
      const embeddings = this.truncatedMobileNet.predict(img);

      // Make a prediction through our newly-trained model using the embeddings
      // from mobilenet as input.
      const predictions = this.model.predict(embeddings);

      // Returns the index with the maximum probability. This number corresponds
      // to the class the model thinks is the most probable given the input.
      return predictions.as1D().argMax();
    });

    (predictedClass.data() as Promise<any>).then(res => {
      const classId = res[0];
      predictedClass.dispose();

      console.log(classId);

      tf.nextFrame();
    });
  }

  private addData() {
    this.trainDataInterval = setInterval(() => {
      tf.tidy(() => {
        const img = this.webcamService.capture(this.video);
        this.controllerDatasetService.addExample(this.truncatedMobileNet.predict(img), this.label);

        // Draw the preview thumbnail.
        this.draw(img, this.sampleElement.nativeElement);

        console.log(`training label: ${this.label}`);
      });
    }, 100);
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
