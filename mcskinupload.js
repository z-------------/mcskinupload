#!/usr/bin/env node

const fs = require("fs");
const mime = require("mime-types");
const needle = require("needle");
const open = require("open");
const path = require("path");

const args = require("yargs")
  .describe("skin", "filename (with or without extension) of skin to use")
    .alias("skin", "s")
    .demandOption("skin")
  .describe("model", "model type to use")
    .alias("model", "m")
    .choices("model", ["classic", "slim"])
    .default("model", "classic")
  .argv;

/* determine skin filename */

const skinFilenameAbs = path.resolve(process.cwd(), args.skin);

/* read file */

let fileBuffer;
try {
  fileBuffer = fs.readFileSync(skinFilenameAbs);
} catch (err) {
  if (err.code === "ENOENT") {
    console.error(`File "${args.skin}" not found.`);
  } else {
    console.error(exp);
  }
  process.exit(1);
}

/* upload file and navigate */

const data = {
  model: args.model,
  file: {
    buffer: fileBuffer,
    filename: args.skin,
    content_type: mime.lookup(skinFilenameAbs)
  }
};

needle.post(`https://file.io/?expires=1`, data, { multipart: true }, (err, res, body) => {
  if (err || Math.floor(res.statusCode / 100) !== 2 || !body.success) {
    if (err) console.error(err);
    else if (body) console.error(body);
    else console.error(`Something went wrong. (HTTP ${res.statusCode})`);
    process.exit(1);
  }
  open(`https://my.minecraft.net/en-us/profile/skin/remote?url=${body.link}&model=${args.model}`);
});
