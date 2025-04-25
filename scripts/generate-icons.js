const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const publicDir = path.join(__dirname, "..", "public");
const sizes = [192, 384, 512];

async function generateIcons() {
  console.log("Generating PNG icons from SVG...");

  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Generate PNGs for each size
    for (const size of sizes) {
      const svgPath = path.join(publicDir, `icon-${size}x${size}.svg`);
      const pngPath = path.join(publicDir, `icon-${size}x${size}.png`);

      if (!fs.existsSync(svgPath)) {
        console.log(`SVG not found: ${svgPath}`);
        continue;
      }

      await sharp(svgPath).resize(size, size).png().toFile(pngPath);

      console.log(`Generated: ${pngPath}`);
    }

    console.log("PNG icon generation complete!");
  } catch (error) {
    console.error("Error generating icons:", error);
  }
}

generateIcons();
