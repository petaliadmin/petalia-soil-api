/**
 * Constantes de style pour le generateur PDF
 * Theme agricole vert
 */

export const PDF_COLORS = {
  primary: '#2D5016',
  secondary: '#4A7C23',
  accent: '#8BC34A',
  headerBg: '#2D5016',
  sectionBg: '#F0F7E8',
  sectionBorder: '#8BC34A',
  tableBorder: '#C8E6C9',
  tableHeaderBg: '#E8F5E9',
  tableAltRow: '#F9FBF7',
  textDark: '#1A1A1A',
  textMedium: '#4A4A4A',
  textLight: '#757575',
  white: '#FFFFFF',
  // Niveaux
  excellent: '#1B5E20',
  bon: '#388E3C',
  modere: '#F9A825',
  bas: '#E65100',
  deficient: '#B71C1C',
  excessif: '#4A148C',
  // Priorites
  haute: '#D32F2F',
  moyenne: '#F57C00',
  basse: '#1976D2',
};

export const PDF_FONTS = {
  titleSize: 22,
  subtitleSize: 14,
  sectionTitleSize: 15,
  subSectionSize: 12,
  bodySize: 10,
  smallSize: 8,
  tableHeaderSize: 9,
  tableCellSize: 9,
};

export const PDF_LAYOUT = {
  pageWidth: 595.28,
  pageHeight: 841.89,
  marginTop: 50,
  marginBottom: 60,
  marginLeft: 50,
  marginRight: 50,
  get contentWidth() {
    return this.pageWidth - this.marginLeft - this.marginRight;
  },
};
