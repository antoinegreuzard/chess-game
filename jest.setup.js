// jest.setup.js
const { createCanvas } = require('canvas');

// Mock de la méthode getContext pour utiliser le package canvas
HTMLCanvasElement.prototype.getContext = function(contextType) {
  if (contextType === '2d') {
    const context = createCanvas(this.width, this.height).getContext('2d');
    jest.spyOn(context, 'fillRect');
    jest.spyOn(context, 'fillText');
    return createCanvas(this.width, this.height).getContext('2d');
  }
  return null;
};
