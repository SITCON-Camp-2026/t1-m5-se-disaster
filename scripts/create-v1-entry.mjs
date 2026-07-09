import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const distDir = "dist";
const v1Dir = join(distDir, "v1");

mkdirSync(v1Dir, { recursive: true });
copyFileSync(join(distDir, "index.html"), join(v1Dir, "index.html"));
