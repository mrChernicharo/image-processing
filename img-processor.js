import { execAsync, idMaker } from "./helper.js";

const COMMAND_NAMES = {
  crop: "crop",
  black_pad: "black_pad",
  abs_scale: "abs_scale",
};

const COMMANDS_FNS = {
  [COMMAND_NAMES.crop]: async (inputPath, outputPath, w, h) => {
    const ffGetImgDimensions = await execAsync(
      `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 ${inputPath}`
    );
    const [origW, origH] = ffGetImgDimensions.stdout.split(",").map(Number);
    const origMainAxis = origH > origW ? "Vert" : "Horiz";
    const targetMainAxis = h > w ? "Vert" : "Horiz";

    const cmd = createCropCommand({ inputPath, outputPath, origMainAxis, targetMainAxis, w, h, origW, origH });
    console.log({ inputPath, outputPath, origMainAxis, targetMainAxis, w, h, origW, origH, cmd });
    return cmd;
  },
  [COMMAND_NAMES.black_pad]: async (inputPath, outputPath, w, h) =>
    `ffmpeg -i ${inputPath} -vf "scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:-1:-1:color=black" ${outputPath}`,
  [COMMAND_NAMES.abs_scale]: async (inputPath, outputPath, w, h) =>
    `ffmpeg -i ${inputPath} -vf "scale=${w}:${h}" ${outputPath}`,
};

function createCropCommand({ inputPath, outputPath, origMainAxis, targetMainAxis, w, h }) {
  if (origMainAxis === "Horiz" && targetMainAxis === "Horiz") {
    if (w === h) {
      return `ffmpeg -i ${inputPath} -vf "scale=${w}:-1" ${outputPath}`;
    }
    return `ffmpeg -i ${inputPath} -vf "scale=${w}:-1,crop=${w}:${h}" ${outputPath}`;
  }
  if (origMainAxis === "Vert" && targetMainAxis === "Vert") {
    if (w === h) {
      return `ffmpeg -i ${inputPath} -vf "scale=-1:${h}" ${outputPath}`;
    }
    return `ffmpeg -i ${inputPath} -vf "scale=-1:${h},crop=${w}:${h}" ${outputPath}`;
  }
  if (origMainAxis === "Horiz" && targetMainAxis === "Vert") {
    if (w === h) {
      return `ffmpeg -i ${inputPath} -vf "scale=-1:${h}" ${outputPath}`;
    }
    return `ffmpeg -i ${inputPath} -vf "scale=-1:${h},crop=${w}:${h}" ${outputPath}`;
  }
  if (origMainAxis === "Vert" && targetMainAxis === "Horiz") {
    if (w === h) {
      return `ffmpeg -i ${inputPath} -vf "scale=${w}:-1" ${outputPath}`;
    }
    return `ffmpeg -i ${inputPath} -vf "scale=${w}:-1,crop=${w}:${h}" ${outputPath}`;
  }
}

function getDesiredDimensions(aspectRatio, maxDim) {
  const [arW, arH] = aspectRatio.split(":").map(Number);
  const mainAxis = arH > arW ? "Vert" : "Horiz";
  const unit = maxDim / (mainAxis === "Horiz" ? arW : arH);
  const dims = [arW * unit, arH * unit].map(Math.floor);

  return [dims[0], dims[1]];
}

async function createProcessedImg(config) {
  const { filename, inputDir, outDir, aspectRatio, maxDim, ffmCommand, format } = config;

  const finalDims = getDesiredDimensions(aspectRatio, maxDim);
  const [w, h] = finalDims;

  const inputPath = `${inputDir}/${filename}`;
  const noExtensionFilename = filename.replace(/\.[^.]*$/, "");
  const outputPath = `${outDir}/${noExtensionFilename}-${w}X${h}-${idMaker(6)}-${ffmCommand}.${format}`;
  const command = await COMMANDS_FNS[ffmCommand](inputPath, outputPath, w, h);

  await execAsync(command).catch(() => {
    console.warn(`ERROR creating ${noExtensionFilename}-${w}X${h}`);
  });
}

export { createProcessedImg };
