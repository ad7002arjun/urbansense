import { Category, Urgency } from "../backend";

export interface ClassificationResult {
  label: string;
  category: Category;
  urgency: Urgency;
  confidence: number;
}

interface ColorProfile {
  r: number;
  g: number;
  b: number;
  brightness: number;
  saturation: number;
}

function getImageColorProfile(canvas: HTMLCanvasElement): ColorProfile {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { r: 128, g: 128, b: 128, brightness: 0.5, saturation: 0 };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let r = 0;
  let g = 0;
  let b = 0;
  const sampleStep = 4 * 4;
  let count = 0;

  for (let i = 0; i < data.length; i += sampleStep) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  r = r / count;
  g = g / count;
  b = b / count;

  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const brightness = (max + min) / 2;
  const saturation =
    max === min ? 0 : (max - min) / (1 - Math.abs(2 * brightness - 1));

  return { r, g, b, brightness, saturation };
}

function analyzeEdgeDensity(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let edges = 0;
  const w = canvas.width;

  for (let y = 1; y < canvas.height - 1; y += 2) {
    for (let x = 1; x < w - 1; x += 2) {
      const idx = (y * w + x) * 4;
      const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const right = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
      const down =
        (data[((y + 1) * w + x) * 4] +
          data[((y + 1) * w + x) * 4 + 1] +
          data[((y + 1) * w + x) * 4 + 2]) /
        3;
      const grad = Math.abs(center - right) + Math.abs(center - down);
      if (grad > 30) edges++;
    }
  }

  return edges / ((canvas.width / 2) * (canvas.height / 2));
}

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.pothole]: "Road Damage / Pothole",
  [Category.waterIssue]: "Water Issue / Flooding",
  [Category.graffiti]: "Graffiti / Vandalism",
  [Category.garbage]: "Garbage / Waste",
  [Category.streetlight]: "Streetlight / Infrastructure",
  [Category.other]: "Other Issue",
};

const CATEGORY_URGENCY: Record<Category, Urgency> = {
  [Category.pothole]: Urgency.urgent,
  [Category.waterIssue]: Urgency.urgent,
  [Category.graffiti]: Urgency.standard,
  [Category.garbage]: Urgency.standard,
  [Category.streetlight]: Urgency.standard,
  [Category.other]: Urgency.standard,
};

export async function classifyImage(
  imageDataUrl: string,
): Promise<ClassificationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSize = 200;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({
          label: "Other Issue",
          category: Category.other,
          urgency: Urgency.standard,
          confidence: 0.5,
        });
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const profile = getImageColorProfile(canvas);
      const edgeDensity = analyzeEdgeDensity(canvas);

      const maxChannel = Math.max(profile.r, profile.g, profile.b);
      const minChannel = Math.min(profile.r, profile.g, profile.b);
      const delta = maxChannel - minChannel;
      let hue = 0;
      if (delta > 5) {
        if (maxChannel === profile.r)
          hue = ((profile.g - profile.b) / delta) % 6;
        else if (maxChannel === profile.g)
          hue = (profile.b - profile.r) / delta + 2;
        else hue = (profile.r - profile.g) / delta + 4;
        hue = (hue * 60 + 360) % 360;
      }

      let category: Category;
      let confidence: number;

      const isBlueish = (hue > 180 && hue < 240) || (hue > 200 && hue < 260);
      const isBrownGray = profile.saturation < 0.15 && profile.brightness < 0.6;
      const isColorful = profile.saturation > 0.25;
      const isDark = profile.brightness < 0.35;
      const isGreenish = hue > 80 && hue < 160;

      if (isBlueish && profile.g < profile.b && profile.brightness < 0.55) {
        category = Category.waterIssue;
        confidence = 0.72;
      } else if (isBrownGray && edgeDensity > 0.08) {
        category = Category.pothole;
        confidence = 0.68;
      } else if (isColorful && !isBlueish && !isGreenish) {
        category = Category.graffiti;
        confidence = 0.65;
      } else if (isGreenish && isDark) {
        category = Category.garbage;
        confidence = 0.6;
      } else if (isDark && edgeDensity < 0.05) {
        category = Category.streetlight;
        confidence = 0.58;
      } else if (isBrownGray && profile.brightness > 0.4) {
        category = Category.pothole;
        confidence = 0.55;
      } else {
        category = Category.other;
        confidence = 0.45;
      }

      resolve({
        label: CATEGORY_LABELS[category],
        category,
        urgency: CATEGORY_URGENCY[category],
        confidence,
      });
    };
    img.onerror = () => {
      resolve({
        label: "Other Issue",
        category: Category.other,
        urgency: Urgency.standard,
        confidence: 0.5,
      });
    };
    img.src = imageDataUrl;
  });
}

export function getCategoryLabel(category: Category): string {
  return CATEGORY_LABELS[category] ?? "Unknown";
}

export function getCategoryIcon(category: Category): string {
  const icons: Record<Category, string> = {
    [Category.pothole]: "🕳️",
    [Category.waterIssue]: "🌊",
    [Category.graffiti]: "🎨",
    [Category.garbage]: "🗑️",
    [Category.streetlight]: "💡",
    [Category.other]: "📍",
  };
  return icons[category] ?? "📍";
}
