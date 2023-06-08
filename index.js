import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs";
import { idMaker } from "./helper.js";
const execAsync = promisify(exec);
// const filename = "mulher-consultas.jpg";
// const filename = "catioro.webp";
const filename = "windows.jpg";

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
    const targetMainAxis = h > w ? "Vert" : "Horiz";
    const origMainAxis = origH > origW ? "Vert" : "Horiz";

    const cmd = createCropCommand({ inputPath, outputPath, origMainAxis, targetMainAxis, w, h });

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
  const dims = [arW * unit, arH * unit];

  return [dims[0], dims[1]];
}

async function createProcessedImg(config) {
  const {
    filepath = `${process.cwd()}/images/input/${filename}`,
    outDir = `${process.cwd()}/images/output`,
    // aspectRatio = "3:1",
    aspectRatio = "1:3",
    maxDim = 1440,
    ffmOp = {},
  } = config;
  const { commandName = "crop", format = "webp", translate = 0.5 } = ffmOp;

  const finalDims = getDesiredDimensions(aspectRatio, maxDim);
  const [w, h] = finalDims;

  const noExtensionFilename = filename.replace(/\.[^.]*$/, "");
  const outputPath = `${outDir}/${noExtensionFilename}-${w}X${h}-${idMaker(8)}-${commandName}.${format}`;
  const command = await COMMANDS_FNS[commandName](filepath, outputPath, w, h);

  await execAsync(command);
}

createProcessedImg({});
