export const themeColors = {
  primary: '#2D9CDB',
  primaryDark: '#207BB0',
  primaryLight: '#EAF6FD',
  textPrimary: '#222222',
  textSecondary: '#828282',
  textMuted: '#BDBDBD',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  border: '#E0E0E0',
  borderLight: '#F2F2F2',
  bannerBackground: '#FEF8E7',
  bannerText: '#333333',
  danger: '#EB5757',
  dangerLight: '#FDEDEC',
  success: '#27AE60',
  successLight: '#E8F8F0',
  shadowColor: '#000000',
};

export const useThemeStyles = () => {
  return {
    colors: themeColors,
  };
};
