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
  abs_scale: "abs_scale",
};
const COMMANDS_FNS = {
  //   [COMMAND_NAMES.crop]: (inputPath, outputPath) => {
  // const ffGetImgDimensions = await execAsync(
  //   `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 ${filepath}`
  // );
  // const [origW, origH] = ffGetImgDimensions.stdout.split(",").map(Number);
  // console.log({ origW, origH, origMainAxis });

  // const origMainAxis = origH > origW ? "Vert" : "Horiz";
  //     return origMainAxis === "Vert"
  //       ? `ffmpeg -i ${inputPath} -vf "scale=-1:${h},crop=${w}:${h}" ${outputPath}`
  //       : `ffmpeg -i ${inputPath} -vf "scale=${w}:-1,crop=${w}:${h}" ${outputPath}`;
  //   },
  //   [COMMAND_NAMES.preserveAspectBlackPad]: (inputPath, outputPath) =>
  //     `ffmpeg -i ${inputPath} -vf "scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:-1:-1:color=black" ${outputPath}`,
  [COMMAND_NAMES.abs_scale]: (inputPath, outputPath, w, h) =>
    `ffmpeg -i ${inputPath} -vf "scale=${w}:${h}" ${outputPath}`,
};

function getDesiredDimensions(aspectRatio, maxDim) {
  const [arW, arH] = aspectRatio.split(":").map(Number);
  const mainAxis = arH > arW ? "Vert" : "Horiz";
  const unit = maxDim / (mainAxis === "Horiz" ? arW : arH);
  const dims = [arW * unit, arH * unit];

  return [dims[0], dims[1]];
}

async function createProcessedImg(config) {
  const {
    filepath = `${process.cwd()}/images/input/${filename}`,
    outDir = `${process.cwd()}/images/output`,
    aspectRatio = "3:2",
    maxDim = 1440,
    ffmOp = {},
  } = config;
  const { commandName = "abs_scale", format = "webp", translate = 0.5 } = ffmOp;

  const finalDims = getDesiredDimensions(aspectRatio, maxDim);
  const [w, h] = finalDims;


  const noExtensionFilename = filename.replace(/\.[^.]*$/, "");
  const outputPath = `${outDir}/${noExtensionFilename}-${w}X${h}-${commandName}.${format}`;
  const command = COMMANDS_FNS[commandName](filepath, outputPath, w, h);

  await execAsync(command);
}

createProcessedImg({});
