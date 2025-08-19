// Illumin8 CMS Brand Theme

export const colors = {
  yellow: '#FFE600',
  orange: '#FF9100',
  lightGray: '#EEEEEE',
  black: '#000000',
  white: '#FFFFFF',
  inputBg: '#f9f9f9',
  inputBorder: '#ccc',
  inputText: '#333',
};

export const fonts = {
  heading: "'Poppins', Helvetica, Arial, Lucida, sans-serif",
  body: "'Poppins', Helvetica, Arial, Lucida, sans-serif",
  main: "'Poppins', Helvetica, Arial, Lucida, sans-serif",
  headingWeight: 700,
  subheadingWeight: 500,
  bodyWeight: 300,
  bodySize: '18px',
  bodyLineHeight: '26px',
};

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '25px',
  pill: '50px',
  card: '25px',
};

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.12)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 25px rgba(0,0,0,0.1)',
  subtle: '0 2px 8px rgba(0,0,0,0.06)',
};

// Brand-compliant styles
export const brandStyles = {
  // Primary button style per brand guide
  button: {
    backgroundColor: colors.yellow,
    borderWidth: '4px',
    borderStyle: 'solid',
    borderColor: colors.orange,
    borderRadius: borderRadius.pill,
    fontWeight: 'bold',
    fontStyle: 'normal',
    textTransform: 'none' as const,
    textDecoration: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    color: colors.black,
    fontFamily: fonts.main,
    cursor: 'pointer',
    padding: '12px 24px',
    fontSize: '16px',
    display: 'inline-block',
  },
  
  // Button hover state
  buttonHover: {
    borderColor: colors.yellow,
    boxShadow: shadows.subtle,
  },
  
  // Form input style per brand guide
  input: {
    fontSize: fonts.bodySize,
    lineHeight: fonts.bodyLineHeight,
    color: colors.inputText,
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.inputBorder}`,
    borderRadius: borderRadius.lg,
    padding: '10px 20px',
    width: '100%',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: 'none',
    height: 'auto',
    fontFamily: fonts.main,
    outline: 'none',
  },
  
  // Input focus state
  inputFocus: {
    borderColor: colors.yellow,
    boxShadow: shadows.subtle,
  },
  
  // Card style
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    boxShadow: shadows.subtle,
    padding: '32px',
    fontFamily: fonts.main,
  },
  
  // Typography styles
  h1: {
    fontSize: '32px',
    fontWeight: fonts.headingWeight,
    fontFamily: fonts.main,
    color: colors.black,
  },
  
  h2: {
    fontSize: '24px',
    fontWeight: fonts.headingWeight,
    fontFamily: fonts.main,
    color: colors.black,
  },
  
  h3: {
    fontSize: '20px',
    fontWeight: fonts.subheadingWeight,
    fontFamily: fonts.main,
    color: colors.black,
  },
  
  body: {
    fontSize: fonts.bodySize,
    lineHeight: fonts.bodyLineHeight,
    fontWeight: fonts.bodyWeight,
    fontFamily: fonts.main,
    color: colors.inputText,
  }
};

// Example usage in a style object:
// style={{ backgroundColor: colors.yellow, borderRadius: borderRadius.lg }} 