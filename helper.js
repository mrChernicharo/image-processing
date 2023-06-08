import { exec } from "node:child_process";
import { promisify } from "node:util";
import { dimensionSchema } from "./constants.js";

const ID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";

export const idMaker = (length = 12) =>
  Array(length)
    .fill(0)
    .map((item) => ID_CHARS.split("")[Math.round(Math.random() * ID_CHARS.length)])
    .join("");

export const execAsync = promisify(exec);

export const getConfigList = ({ filename, inputDir, outDir, schemaName, format, ffmCommand = "crop" }) => {
  const outDims = dimensionSchema[schemaName];
  const configList = [];
  for (const outImgConfig of outDims) {
    configList.push({
      filename,
      inputDir,
      outDir,
      format,
      ffmCommand,
      ...outImgConfig,
    });
  }
  return configList;
};
