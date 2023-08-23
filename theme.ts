/* eslint-disable import/prefer-default-export */
import { buildLegacyTheme } from 'sanity';

const props = {
  '--dark': '#272727',
  '--light': '#ECECEC',
  '--untele': '#D70606',
  '--accent-blue': '#0301F7',
  '--accent-yellow': '#F4F502',
  '--accent-green': '#0BE90B',
  '--slate-dark': '#594F4D',
  '--slate-light': '#Cfcfd4',
};

export const myTheme = buildLegacyTheme({
  // Base Theme Colors
  '--black': props['--dark'],
  '--white': props['--light'],
  '--gray': props['--slate-dark'],
  '--gray-base': props['--slate-dark'],

  '--component-bg': props['--dark'],
  '--component-text-color': props['--light'],

  // Brand
  '--brand-primary': props['--untele'],

  // Buttons
  '--default-button-color': props['--slate-dark'],
  '--default-button-primary-color': props['--untele'],
  '--default-button-success-color': props['--accent-green'],
  '--default-button-warning-color': props['--accent-blue'],
  '--default-button-danger-color': props['--accent-yellow'],

  // State
  '--state-info-color': props['--untele'],
  '--state-success-color': props['--accent-green'],
  '--state-warning-color': props['--accent-blue'],
  '--state-danger-color': props['--accent-yellow'],

  // Navbar
  '--main-navigation-color': props['--dark'],
  '--main-navigation-color--inverted': props['--light'],

  '--focus-color': props['--untele'],
});
