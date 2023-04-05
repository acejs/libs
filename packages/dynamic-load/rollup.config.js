import pkg from "./package.json" assert { type: "json" };
import baseConfig from "../../rollup.config.js";

const config = baseConfig({
  input: "lib/index.ts",
  output: [
    { file: pkg.module, format: "esm", exports: "named" },
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
    },
  ],
});

export default config;
