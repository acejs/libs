import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

const config = (argus) => {
  const { input, output } = argus;
  return {
    input,
    output,
    plugins: [typescript(), terser()],
  };
};

export default config;
