import json from "@rollup/plugin-json";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/amap-card.js",
    format: "cjs",
  },
  plugins: [json(), typescript(), commonjs()],
};
