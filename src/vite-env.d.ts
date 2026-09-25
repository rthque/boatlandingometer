/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Set only for builds that are NOT the live site — the /test/ sub-site sets
   * it to "TEST". Turns on the badge and the robots noindex tag. Unset in the
   * root build, where Vite substitutes undefined and the badge tree-shakes out.
   */
  readonly VITE_BUILD_LABEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
