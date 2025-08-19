import React from 'react';
import { colors } from '../brand';

// Bootstrap Icons - Use proper icons instead of emojis per brand guide
import { 
  House,
  FileText,
  Image,
  Cart,
  People,
  Gear,
  Globe,
  BoxArrowRight,
  Upload,
  Copy,
  Trash,
  Pencil,
  Plus,
  Check,
  X,
  Eye,
  Download,
  Search,
  Grid,
  List,
  Filter,
  SortUp,
  SortDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Star,
  Heart,
  Share,
  Link45deg,
  Folder,
  FileEarmark,
  Camera,
  PlayCircle,
  StopCircle,
  PauseCircle,
  VolumeUp,
  VolumeDown,
  VolumeMute,
  Brightness,
  Contrast,
  Palette,
  TypeBold,
  TypeItalic,
  Save,
  CloudUpload,
  Shield,
  Key,
  Lock,
  TypeUnderline,
  JustifyLeft,
  JustifyCenter,
  JustifyRight,
  ListUl,
  ListOl,
  Quote,
  Code,
  Link,
  Unlink,
  CloudDownload,
  Unlock,
  PersonCheck,
  PersonX,
  Bell,
  BellSlash,
  Envelope,
  Phone,
  Chat,
  QuestionCircle,
  InfoCircle,
  ExclamationTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  CaretDown
} from 'react-bootstrap-icons';

// Icon wrapper component for consistent styling
interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Export all icons with consistent props
export const Icons = {
  // Navigation
  Dashboard: (props: IconProps) => <House size={props.size || 16} color={props.color || colors.black} {...props} />,
  Pages: (props: IconProps) => <FileText size={props.size || 16} color={props.color || colors.black} {...props} />,
  Media: (props: IconProps) => <Image size={props.size || 16} color={props.color || colors.black} {...props} />,
  Products: (props: IconProps) => <Cart size={props.size || 16} color={props.color || colors.black} {...props} />,
  Users: (props: IconProps) => <People size={props.size || 16} color={props.color || colors.black} {...props} />,
  Settings: (props: IconProps) => <Gear size={props.size || 16} color={props.color || colors.black} {...props} />,
  
  // Actions
  ViewSite: (props: IconProps) => <Globe size={props.size || 16} color={props.color || colors.black} {...props} />,
  Logout: (props: IconProps) => <BoxArrowRight size={props.size || 16} color={props.color || colors.black} {...props} />,
  Upload: (props: IconProps) => <Upload size={props.size || 16} color={props.color || colors.black} {...props} />,
  Copy: (props: IconProps) => <Copy size={props.size || 16} color={props.color || colors.black} {...props} />,
  Delete: (props: IconProps) => <Trash size={props.size || 16} color={props.color || colors.black} {...props} />,
  Edit: (props: IconProps) => <Pencil size={props.size || 16} color={props.color || colors.black} {...props} />,
  Add: (props: IconProps) => <Plus size={props.size || 16} color={props.color || colors.black} {...props} />,
  Save: (props: IconProps) => <Save size={props.size || 16} color={props.color || colors.black} {...props} />,
  
  // Status
  Check: (props: IconProps) => <Check size={props.size || 16} color={props.color || colors.black} {...props} />,
  Close: (props: IconProps) => <X size={props.size || 16} color={props.color || colors.black} {...props} />,
  Success: (props: IconProps) => <CheckCircle size={props.size || 16} color={props.color || '#28a745'} {...props} />,
  Error: (props: IconProps) => <XCircle size={props.size || 16} color={props.color || '#dc3545'} {...props} />,
  Warning: (props: IconProps) => <ExclamationTriangle size={props.size || 16} color={props.color || '#ffc107'} {...props} />,
  Info: (props: IconProps) => <InfoCircle size={props.size || 16} color={props.color || '#17a2b8'} {...props} />,
  
  // Navigation arrows
  ChevronLeft: (props: IconProps) => <ChevronLeft size={props.size || 16} color={props.color || colors.black} {...props} />,
  ChevronRight: (props: IconProps) => <ChevronRight size={props.size || 16} color={props.color || colors.black} {...props} />,
  ArrowLeft: (props: IconProps) => <ArrowLeft size={props.size || 16} color={props.color || colors.black} {...props} />,
  ArrowRight: (props: IconProps) => <ArrowRight size={props.size || 16} color={props.color || colors.black} {...props} />,
  
  // File types
  Folder: (props: IconProps) => <Folder size={props.size || 16} color={props.color || colors.black} {...props} />,
  File: (props: IconProps) => <FileEarmark size={props.size || 16} color={props.color || colors.black} {...props} />,
  
  // Media
  Camera: (props: IconProps) => <Camera size={props.size || 16} color={props.color || colors.black} {...props} />,
  Video: (props: IconProps) => <PlayCircle size={props.size || 16} color={props.color || colors.black} {...props} />,
  
  // Utility
  Search: (props: IconProps) => <Search size={props.size || 16} color={props.color || colors.black} {...props} />,
  Filter: (props: IconProps) => <Filter size={props.size || 16} color={props.color || colors.black} {...props} />,
  Grid: (props: IconProps) => <Grid size={props.size || 16} color={props.color || colors.black} {...props} />,
  List: (props: IconProps) => <List size={props.size || 16} color={props.color || colors.black} {...props} />,
  Eye: (props: IconProps) => <Eye size={props.size || 16} color={props.color || colors.black} {...props} />,
  Download: (props: IconProps) => <Download size={props.size || 16} color={props.color || colors.black} {...props} />,
  CloudUpload: (props: IconProps) => <CloudUpload size={props.size || 16} color={props.color || colors.black} {...props} />,
  
  // Security
  Shield: (props: IconProps) => <Shield size={props.size || 16} color={props.color || colors.black} {...props} />,
  Key: (props: IconProps) => <Key size={props.size || 16} color={props.color || colors.black} {...props} />,
  Lock: (props: IconProps) => <Lock size={props.size || 16} color={props.color || colors.black} {...props} />,
  
  // Communication
  Bell: (props: IconProps) => <Bell size={props.size || 16} color={props.color || colors.black} {...props} />,
  Envelope: (props: IconProps) => <Envelope size={props.size || 16} color={props.color || colors.black} {...props} />,
  Chat: (props: IconProps) => <Chat size={props.size || 16} color={props.color || colors.black} {...props} />,
  
  // Help
  Help: (props: IconProps) => <QuestionCircle size={props.size || 16} color={props.color || colors.black} {...props} />,
}; 