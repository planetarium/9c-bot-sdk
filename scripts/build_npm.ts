// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "@planetarium/9c-bot-sdk",
    version: Deno.args[0],
    description:
      "A development kit to help you easily write scripts or bots related to Nine Chronicles in JavaScript (Node.js / Deno).",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/planetarium/9c-bot-sdk.git",
    },
    bugs: {
      url: "https://github.com/planetarium/9c-bot-sdk/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
