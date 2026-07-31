/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENT_TYPE: 'lp' | 'linkbio';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
