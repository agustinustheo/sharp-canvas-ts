import sharp from "sharp";
import axios from "axios";
import { createCanvas, CanvasRenderingContext2D } from "canvas";

const maxWidth = 125;

async function downloadImage(url: string) {
  try {
    // Fetch the image using axios with responseType set to 'arraybuffer'
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return response.data;
  } catch (e) {
    console.error("Error downloading image:", e);
    throw e;
  }
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(" ");
  let lines: string[] = [];
  let currentLine: string = words[0];

  for (let i = 1; i < words.length; i++) {
    let word = words[i];
    let width = context.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine); // Push the last line
  return lines;
}

function cutAndAddEllipsis(text: string) {
  if (text.length <= maxWidth) {
    return text;
  }

  return text.substring(0, maxWidth) + "...";
}

async function addTextToImage(
  imagePath: string,
  outputPath: string,
  text: string,
  fontPath: string,
  fontSize: number = 48,
) {
  try {
    // Download image
    const imageBuffer = await downloadImage(imagePath);

    // Cut the text if needed and add an ellipsis
    text = cutAndAddEllipsis(text);

    // Load the original image to get its dimensions
    const originalImage = await sharp(imageBuffer).metadata();

    // Create a canvas that matches the original image's dimensions
    const canvas = createCanvas(originalImage.width!, originalImage.height!);
    const context = canvas.getContext("2d");

    // Optional: Register a custom font
    context.font = `${fontSize}px sans-serif`;
    context.fillStyle = "black"; // Text color
    context.textAlign = "left";
    context.textBaseline = "top";

    const maxWidth = originalImage.width! * 0.8; // Max width for the text
    const lineHeight = fontSize * 1.2; // Line height
    const lines = wrapText(context, text, maxWidth);
    const textHeight = lines.length * lineHeight; // Calculate the total height of the text block

    // Calculate the starting Y position to center the text block
    const startY = (originalImage.height! - textHeight) / 2;

    // Draw each line of text
    lines.forEach((line, i) => {
      const x = (originalImage.width! - context.measureText(line).width) / 2; // Center each line
      const y = startY + i * lineHeight;
      context.fillText(line, x, y);
    });

    // Convert the canvas to a Buffer
    const textBuffer = canvas.toBuffer();

    // Overlay the text image on the original image
    await sharp(imageBuffer)
      .composite([{ input: textBuffer, blend: "over" }])
      .toFile(outputPath);

    console.log("Image processed and saved to:", outputPath);
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

// Example usage - adjust fontPath and imagePath as necessary
addTextToImage(
  "https://raw.githubusercontent.com/agustinustheo/sharp-canvas-ts/main/template.jpg",
  "./output-image-with-text.jpg",
  "As the sun dipped below the horizon, casting hues of orange and pink across the sky, the quiet town came to life with the gentle...",
  "./font.otf",
);
