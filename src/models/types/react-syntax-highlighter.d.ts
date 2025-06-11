// src/types/react-syntax-highlighter.d.ts
declare module 'react-syntax-highlighter' {
  import React from 'react';

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export class Prism extends React.Component<SyntaxHighlighterProps> {}

  export default class SyntaxHighlighter extends React.Component<SyntaxHighlighterProps> {}
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const dark: any;
  export const light: any;
  export const atomDark: any;
  export const base16AteliersulphurpoolLight: any;
  export const cb: any;
  export const coldarkCold: any;
  export const coldarkDark: any;
  export const coy: any;
  export const coyWithoutShadows: any;
  export const darcula: any;
  export const dracula: any;
  export const duotoneDark: any;
  export const duotoneEarth: any;
  export const duotoneForest: any;
  export const duotoneLight: any;
  export const duotoneSea: any;
  export const duotoneSpace: any;
  export const funky: any;
  export const ghcolors: any;
  export const gruvboxDark: any;
  export const gruvboxLight: any;
  export const hopscotch: any;
  export const lucario: any;
  export const materialDark: any;
  export const materialLight: any;
  export const materialOceanic: any;
  export const nightOwl: any;
  export const nord: any;
  export const okaidia: any;
  export const oneDark: any;
  export const oneLight: any;
  export const pojoaque: any;
  export const prism: any;
  export const shadesOfPurple: any;
  export const solarizedlight: any;
  export const synthwave84: any;
  export const tomorrow: any;
  export const twilight: any;
  export const vscDarkPlus: any;
  export const vs: any;
  export const xonokai: any;
  export const zTouch: any;
}
