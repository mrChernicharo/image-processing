import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import { idMaker } from "./helper.js";
const execAsync = promisify(exec);

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

    const cmd = createCropCommand({ inputPath, outputPath, origMainAxis, targetMainAxis, w, h });
    console.log({ cmd });
    return cmd;
  },
  [COMMAND_NAMES.black_pad]: async (inputPath, outputPath, w, h) =>
    `ffmpeg -i ${inputPath} -vf "scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:-1:-1:color=black" ${outputPath}`,
  [COMMAND_NAMES.abs_scale]: async (inputPath, outputPath, w, h) =>
    `ffmpeg -i ${inputPath} -vf "scale=${w}:${h}" ${outputPath}`,
};

function createCropCommand({ inputPath, outputPath, origMainAxis, targetMainAxis, w, h }) {
  console.log({ inputPath, outputPath, origMainAxis, targetMainAxis, w, h });

  if (origMainAxis === "Horiz" && targetMainAxis === "Horiz") {
    return `ffmpeg -i ${inputPath} -vf "scale=${w}:-1,crop=${w}:${h}" ${outputPath}`;
  }
  if (origMainAxis === "Vert" && targetMainAxis === "Vert") {
    return `ffmpeg -i ${inputPath} -vf "scale=-1:${h},crop=${w}:${h}" ${outputPath}`;
  }
  if (origMainAxis === "Horiz" && targetMainAxis === "Vert") {
    return `ffmpeg -i ${inputPath} -vf "scale=-1:${h},crop=${w}:${h}" ${outputPath}`;
  }
  if (origMainAxis === "Vert" && targetMainAxis === "Horiz") {
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
  const {
    filename = "blah.png",
    inputDir = `${process.cwd()}/images/input`,
    outDir = `${process.cwd()}/images/output`,
    aspectRatio = "3:2",
    maxDim = 1080,
    ffmCommand = "crop",
    format = "webp",
  } = config;

  const finalDims = getDesiredDimensions(aspectRatio, maxDim);
  const [w, h] = finalDims;

  const inputPath = `${inputDir}/${filename}`;
  const noExtensionFilename = filename.replace(/\.[^.]*$/, "");
  const outputPath = `${outDir}/${noExtensionFilename}-${w}X${h}-${idMaker(6)}-${ffmCommand}.${format}`;
  const command = await COMMANDS_FNS[ffmCommand](inputPath, outputPath, w, h);

  await execAsync(command);
}

// createProcessedImg({});
// clear /files/output
const inputDir = `${process.cwd()}/images/input`;
const outDir = `${process.cwd()}/images/output`;
fs.readdirSync(outDir).forEach((file) => fs.rmSync(`${outDir}/${file}`));

createProcessedImg({
  filename: "windows.jpg",
  inputDir,
  outDir,
  aspectRatio: "3:1",
  maxDim: 2000,
  ffmCommand: "crop",
  format: "webp",
});

createProcessedImg({
  filename: "windows.jpg",
  inputDir,
  outDir,
  aspectRatio: "1:3",
  maxDim: 2000,
  ffmCommand: "crop",
  format: "webp",
});


createProcessedImg({
  filename: "windows.jpg",
  inputDir,
  outDir,
  aspectRatio: "3:1",
  maxDim: 2000,
  ffmCommand: "black_pad",
  format: "webp",
});

createProcessedImg({
  filename: "mulher-consultas.jpg",
  inputDir,
  outDir,
  aspectRatio: "3:1",
  maxDim: 3000,
  ffmCommand: "crop",
  format: "webp",
});

createProcessedImg({
  filename: "mulher-consultas.jpg",
  inputDir,
  outDir,
  aspectRatio: "1:3",
  maxDim: 3000,
  ffmCommand: "crop",
  format: "webp",
});

createProcessedImg({
  filename: "mulher-consultas.jpg",
  inputDir,
  outDir,
  aspectRatio: "1:3",
  maxDim: 3000,
  ffmCommand: "black_pad",
  format: "webp",
});
