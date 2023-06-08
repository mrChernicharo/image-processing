export const inputDir = `${process.cwd()}/images/input`;
export const outDir = `${process.cwd()}/images/output`;

export const dimensionSchema = {
  custom: [
    { aspectRatio: "3:2", maxDim: 1280 }, // classic
    { aspectRatio: "16:9", maxDim: 1280 }, // wide
    { aspectRatio: "21:9", maxDim: 1280 }, // Ultrawide
    { aspectRatio: "32:9", maxDim: 1280 }, // Super Ultrawide
    { aspectRatio: "9:16", maxDim: 1280 }, // Mobile
  ],
  instagram: [
    { aspectRatio: "1:1", maxDim: 1080 },
    { aspectRatio: "9:16", maxDim: 1920 },
  ],
  twitter: [
    { aspectRatio: "1:1", maxDim: 400 },
    { aspectRatio: "3:1", maxDim: 1500 },
    { aspectRatio: "2:1", maxDim: 1024 },
  ],
  facebook: [
    { aspectRatio: "1:1", maxDim: 128 },
    { aspectRatio: "1:1", maxDim: 1080 },
    { aspectRatio: "16:9", maxDim: 820 },
    { aspectRatio: "16:9", maxDim: 1280 },
    { aspectRatio: "9:16", maxDim: 1280 },
  ],
};
