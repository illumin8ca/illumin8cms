import React from 'react';
import { colors, fonts, borderRadius, shadows, brandStyles } from '../brand';

// Brand-compliant Button Component
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  size = 'medium',
  style = {}
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.lightGray,
          borderColor: '#ccc',
          color: colors.black,
        };
      case 'danger':
        return {
          backgroundColor: '#ffebee',
          borderColor: '#f8bbd9',
          color: '#c62828',
        };
      default:
        return {
          backgroundColor: colors.yellow,
          borderColor: colors.orange,
          color: colors.black,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { padding: '6px 12px', fontSize: '14px' };
      case 'large':
        return { padding: '16px 32px', fontSize: '18px' };
      default:
        return { padding: '12px 24px', fontSize: '16px' };
    }
  };

  const buttonStyle = {
    ...brandStyles.button,
    ...getVariantStyle(),
    ...getSizeStyle(),
    ...style,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={buttonStyle}
      onMouseEnter={(e) => {
        if (!disabled && variant === 'primary') {
          Object.assign(e.currentTarget.style, brandStyles.buttonHover);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.borderColor = colors.orange;
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {children}
    </button>
  );
};

// Brand-compliant Input Component
interface InputProps {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  style = {}
}) => {
  const inputStyle = {
    ...brandStyles.input,
    ...style,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      style={inputStyle}
      onFocus={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, brandStyles.inputFocus);
        }
      }}
      onBlur={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = colors.inputBorder;
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    />
  );
};

// Brand-compliant Textarea Component
interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  style?: React.CSSProperties;
}

export const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  style = {}
}) => {
  const textareaStyle = {
    ...brandStyles.input,
    minHeight: `${rows * 1.5}em`,
    resize: 'vertical' as const,
    ...style,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      rows={rows}
      style={textareaStyle}
      onFocus={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, brandStyles.inputFocus);
        }
      }}
      onBlur={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = colors.inputBorder;
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    />
  );
};

// Brand-compliant Card Component
interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  style = {},
  hover = false,
  onClick
}) => {
  const cardStyle = {
    ...brandStyles.card,
    ...style,
    transition: hover ? 'transform 0.3s ease, box-shadow 0.3s ease' : 'none',
    cursor: onClick ? 'pointer' : 'default',
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = shadows.lg;
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = shadows.subtle;
        }
      }}
    >
      {title && (
        <h2 style={{ ...brandStyles.h2, marginTop: 0, marginBottom: '24px' }}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

// Brand-compliant Typography Components
interface HeadingProps {
  children: React.ReactNode;
  level: 1 | 2 | 3;
  style?: React.CSSProperties;
}

export const Heading: React.FC<HeadingProps> = ({ children, level, style = {} }) => {
  const headingStyle = level === 1 ? brandStyles.h1 : level === 2 ? brandStyles.h2 : brandStyles.h3;
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag style={{ ...headingStyle, ...style }}>
      {children}
    </Tag>
  );
};

// Form Group Component for consistent spacing
interface FormGroupProps {
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  style?: React.CSSProperties;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  label,
  required = false,
  style = {}
}) => {
  return (
    <div style={{ marginBottom: '16px', ...style }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: fonts.subheadingWeight,
          fontFamily: fonts.main,
          color: colors.black,
          fontSize: '16px'
        }}>
          {label}
          {required && <span style={{ color: '#c62828', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      {children}
    </div>
  );
}; 