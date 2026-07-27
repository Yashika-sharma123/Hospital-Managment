/**
 * Linear + Logistic regression implemented from scratch using batch
 * gradient descent. No scikit-learn, no tensorflow — just the maths,
 * so it's easy to explain in an interview:
 *   1. Normalize features (z-score) so gradient descent converges evenly
 *   2. Start weights at 0, repeatedly nudge them opposite the gradient
 *      of the loss function
 *   3. Stop after a fixed number of iterations
 */

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function std(arr, m) {
  const variance = arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance) || 1; // avoid divide-by-zero for constant columns
}

class LinearRegression {
  constructor({ learningRate = 0.1, iterations = 3000 } = {}) {
    this.learningRate = learningRate;
    this.iterations = iterations;
    this.weights = null;
    this.bias = 0;
    this.featureMeans = [];
    this.featureStds = [];
    this.residualStd = 0; // used later to build a confidence range
  }

  _normalize(X) {
    return X.map((row) => row.map((val, j) => (val - this.featureMeans[j]) / this.featureStds[j]));
  }

  fit(X, y) {
    const nFeatures = X[0].length;
    const nSamples = X.length;

    this.featureMeans = Array.from({ length: nFeatures }, (_, j) => mean(X.map((row) => row[j])));
    this.featureStds = Array.from({ length: nFeatures }, (_, j) => std(X.map((row) => row[j]), this.featureMeans[j]));

    const Xn = this._normalize(X);
    this.weights = new Array(nFeatures).fill(0);
    this.bias = 0;

    for (let iter = 0; iter < this.iterations; iter++) {
      const predictions = Xn.map((row) => this._dot(row, this.weights) + this.bias);
      const errors = predictions.map((p, i) => p - y[i]);

      const gradWeights = new Array(nFeatures).fill(0);
      for (let j = 0; j < nFeatures; j++) {
        gradWeights[j] = (2 / nSamples) * Xn.reduce((sum, row, i) => sum + errors[i] * row[j], 0);
      }
      const gradBias = (2 / nSamples) * errors.reduce((a, b) => a + b, 0);

      for (let j = 0; j < nFeatures; j++) {
        this.weights[j] -= this.learningRate * gradWeights[j];
      }
      this.bias -= this.learningRate * gradBias;
    }

    // residual std dev on the training set -> used for a +/- confidence range
    const finalPredictions = Xn.map((row) => this._dot(row, this.weights) + this.bias);
    const residuals = finalPredictions.map((p, i) => y[i] - p);
    this.residualStd = std(residuals, 0);
  }

  _dot(a, b) {
    return a.reduce((sum, v, i) => sum + v * b[i], 0);
  }

  predict(x) {
    const normalized = x.map((val, j) => (val - this.featureMeans[j]) / this.featureStds[j]);
    return this._dot(normalized, this.weights) + this.bias;
  }
}

class LogisticRegression extends LinearRegression {
  _sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
  }

  fit(X, y) {
    const nFeatures = X[0].length;
    const nSamples = X.length;

    this.featureMeans = Array.from({ length: nFeatures }, (_, j) => mean(X.map((row) => row[j])));
    this.featureStds = Array.from({ length: nFeatures }, (_, j) => std(X.map((row) => row[j]), this.featureMeans[j]));

    const Xn = this._normalize(X);
    this.weights = new Array(nFeatures).fill(0);
    this.bias = 0;

    for (let iter = 0; iter < this.iterations; iter++) {
      const predictions = Xn.map((row) => this._sigmoid(this._dot(row, this.weights) + this.bias));
      const errors = predictions.map((p, i) => p - y[i]);

      const gradWeights = new Array(nFeatures).fill(0);
      for (let j = 0; j < nFeatures; j++) {
        gradWeights[j] = (1 / nSamples) * Xn.reduce((sum, row, i) => sum + errors[i] * row[j], 0);
      }
      const gradBias = (1 / nSamples) * errors.reduce((a, b) => a + b, 0);

      for (let j = 0; j < nFeatures; j++) {
        this.weights[j] -= this.learningRate * gradWeights[j];
      }
      this.bias -= this.learningRate * gradBias;
    }
  }

  predict(x) {
    const normalized = x.map((val, j) => (val - this.featureMeans[j]) / this.featureStds[j]);
    return this._sigmoid(this._dot(normalized, this.weights) + this.bias); // probability 0-1
  }
}

module.exports = { LinearRegression, LogisticRegression };
