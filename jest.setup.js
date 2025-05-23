// jest.setup.js
const { createCanvas } = require('canvas');

// Mock `import.meta` global object
global.importMeta = () => ({ url: '' });

// Mock the getContext method to use the canvas package for 2D contexts
HTMLCanvasElement.prototype.getContext = function (contextType) {
  if (contextType === '2d') {
    const canvas = createCanvas(this.width, this.height);
    const context = canvas.getContext('2d');

    // Mock `fillRect` and `fillText` directly
    context.fillRect = jest.fn();
    context.fillText = jest.fn();

    return context;
  }
  return null;
};
