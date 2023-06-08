import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs";
const execAsync = promisify(exec);
// const filename = "mulher-consultas.jpg";
// const filename = "catioro.webp";
const filename = "windows.jpg";
const COMMAND_NAMES = {
  crop: "crop",
  blackPad: "blackPad",
  scaleAbs: "scaleAbs",
};

function getDesiredDimensions(aspectRatio, maxDim) {
  const [arW, arH] = aspectRatio.split(":").map(Number);
  const mainAxis = arH > arW ? "Vert" : "Horiz";
  const unit = maxDim / (mainAxis === "Horiz" ? arW : arH);
  const dims = [arW * unit, arH * unit];

  return [dims[0], dims[1]];
}

async function createProcessedImgs(config) {
  const {
    filepath = `${process.cwd()}/images/input/${filename}`,
    outDir = `${process.cwd()}/images/output`,
    aspectRatio = "9:16",
    // aspectRatio = "16:9",
    // aspectRatio = "3:2",
    maxDim = 1440,
    ffmOp = {},
  } = config;
  const { name = "crop", format = "webp", translate = 0.5 } = ffmOp;

  const ffGetImgDimensions = await execAsync(
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 ${filepath}`
  );
  const [origW, origH] = ffGetImgDimensions.stdout.split(",").map(Number);
  const origMainAxis = origH > origW ? "Vert" : "Horiz";
  console.log({ origW, origH, origMainAxis });

  const finalDims = getDesiredDimensions(aspectRatio, maxDim);
  console.log({ finalDims });

  // const [w, h] = aspectRatio

  // const COMMANDS_FNS = {
  //   [COMMAND_NAMES.crop]: (inputPath, outputPath) => {
  //     return origMainAxis === "Vert"
  //       ? `ffmpeg -i ${inputPath} -vf "scale=-1:${h},crop=${w}:${h}" ${outputPath}`
  //       : `ffmpeg -i ${inputPath} -vf "scale=${w}:-1,crop=${w}:${h}" ${outputPath}`;
  //   },
  //   [COMMAND_NAMES.preserveAspectBlackPad]: (inputPath, outputPath) =>
  //     `ffmpeg -i ${inputPath} -vf "scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:-1:-1:color=black" ${outputPath}`,
  //   [COMMAND_NAMES.scaleAbs]: (inputPath, outputPath) => `ffmpeg -i ${inputPath} -vf "scale=${w}:${h}" ${outputPath}`,
  // };
}

// createProcessedImgs({ ffmOp: {} });
createProcessedImgs({});
