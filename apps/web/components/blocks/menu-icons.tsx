import {
  Home,
  Info,
  Mail,
  Phone,
  ShoppingCart,
  Star,
  Tag,
  FileText,
  type LucideIcon,
} from 'lucide-react';

/** Optional icon set for menu items — shared by the editor picker and render. */
export const MENU_ICONS: Record<string, LucideIcon> = {
  home: Home,
  info: Info,
  mail: Mail,
  phone: Phone,
  star: Star,
  tag: Tag,
  file: FileText,
  cart: ShoppingCart,
};

export const MENU_ICON_KEYS = Object.keys(MENU_ICONS);
