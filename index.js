import fs from "node:fs";
import { execAsync, getConfigList, idMaker } from "./helper.js";
import { createProcessedImg } from "./img-processor.js";
import { inputDir, outDir } from "./constants.js";

fs.readdirSync(outDir).forEach((file) => fs.rmSync(`${outDir}/${file}`));

const lsInputFiles = await execAsync(`ls ${inputDir}`);
const inputFiles = lsInputFiles.stdout.split("\n").filter(Boolean);
const outImgConfigList = [];

for await (const filename of inputFiles) {
  const configList = getConfigList({
    filename,
    inputDir,
    outDir,
    schemaName: "facebook",
    ffmCommand: "crop",
    format: "webp",
  });
  console.log({ configList });
  for await (const config of configList) {
    await createProcessedImg(config);
  }
}
