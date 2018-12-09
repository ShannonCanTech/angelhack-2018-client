import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root'
})
export class ModelAgentService {

  truncatedMobileNet: tf.Model;

  model: any;

  constructor() { }

  hasTrained() {
    return this.model && this.truncatedMobileNet;
  }
  
  // Loads mobilenet and returns a model that returns the internal activation
  // we'll use as input to our classifier model.
  loadTruncatedMobileNet(): Promise<any> {
    return tf.loadModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json').then(mobilenet => {
      // Return a model that outputs an internal activation.
      const layer = mobilenet.getLayer('conv_pw_13_relu');
      this.truncatedMobileNet = tf.model({ inputs: mobilenet.inputs, outputs: layer.output });
    });
  }

  predict(img) {
    if (!this.model || !this.truncatedMobileNet) {
      console.error('Data not trained yet');
      return;
    }

    return tf.tidy(() => {
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
  }
}
