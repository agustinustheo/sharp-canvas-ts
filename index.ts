import sharp from 'sharp';
import { createCanvas, registerFont } from 'canvas';

async function addTextToImage(imagePath: string, outputPath: string, text: string, fontPath: string, fontSize: number = 48) {
  try {
    // Load the original image to get its dimensions
    const originalImage = await sharp(imagePath).metadata();

    // Create a canvas that matches the original image's dimensions
    const canvas = createCanvas(originalImage.width!, originalImage.height!);
    const context = canvas.getContext('2d');

    // Optional: Register a custom font
    registerFont(fontPath, { family: 'CustomFont' });
    context.font = `${fontSize}px CustomFont`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = 'black'; // Text color

    // Calculate text position (center of the image)
    const textX = canvas.width / 2;
    const textY = canvas.height / 2;

    // Add text to the canvas
    context.fillText(text, textX, textY);

    // Convert the canvas to a Buffer
    const textBuffer = canvas.toBuffer();

    // Overlay the text image on the original image
    await sharp(imagePath)
      .composite([{ input: textBuffer, blend: 'over' }])
      .toFile(outputPath);

    console.log('Image processed and saved to:', outputPath);
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

// Example usage - adjust fontPath and imagePath as necessary
addTextToImage('./template.jpg', './output-image-with-text.jpg', 'Hello, World!', './font.otf');
