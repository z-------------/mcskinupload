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

/* consts */

const SKINS_DIRNAME = "skins";

/* determine skin filename */

let filenames;
try {
  filenames = fs.readdirSync(SKINS_DIRNAME);
} catch (exp) {
  console.error("Could not access skins directory.");
  process.exit(1);
}
let skinFilename;
for (let filename of filenames) {
  if (filename === args.skin || path.parse(filename).name === args.skin) {
    skinFilename = filename;
    break;
  }
}
if (!skinFilename) {
  console.error("Skin file not found.");
  process.exit(1);
}
const skinFilenameAbs = path.resolve(path.join(SKINS_DIRNAME, skinFilename));

/* upload file and navigate to web skins settings */

const data = {
  model: args.model,
  file: {
    file: skinFilenameAbs,
    content_type: mime.lookup(skinFilename)
  }
};

needle.post(`https://file.io/?expires=1`, data, { multipart: true }, (err, res, body) => {
  if (err || Math.floor(res.statusCode / 100) !== 2 || !body.success) {
    if (err) console.error(err);
    else if (body) console.error(JSON.parse(body));
    else console.error(`Something went wrong. (HTTP ${res.statusCode})`);
    process.exit(1);
  }
  open(`https://my.minecraft.net/en-us/profile/skin/remote?url=${body.link}&model=${args.model}`);
});
