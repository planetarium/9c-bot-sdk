deno run --allow-write="./npm,$HOME/Library/Application Support/deno-wasmbuild" \
    --allow-read=".,./npm,$HOME/Library/Caches/deno,$HOME/Library/Application Support/deno-wasmbuild,../node_modules/,../../node_modules/,../../../node_modules/,../../../../node_modules/,../../../../../../node_modules/" \
    --allow-net="deno.land" \
    --allow-env="DENO_DIR,HOME,DENO_AUTH_TOKENS" \
    --allow-run="npm" \
    scripts/build_npm.ts
