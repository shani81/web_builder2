import {
  BarChart3,
  Building2,
  Columns3,
  CreditCard,
  Heading,
  HelpCircle,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  Heading1,
  Mail,
  Megaphone,
  MousePointerClick,
  Navigation,
  PanelBottom,
  Quote,
  Send,
  SeparatorHorizontal,
  Square,
  Timer,
  Type,
  Users,
  Video as VideoIcon,
} from 'lucide-react';
import type { Block, BlockType } from '@buildr/types';
import { shortId } from '@buildr/utils';
import type { BlockDefinition, InspectorField } from './types';
import { SECTION_LAYOUTS, layoutById } from './section-layouts';
import { NavbarBlock } from './navbar.block';
import { HeroBlock } from './hero.block';
import { FeaturesBlock } from './features.block';
import { TestimonialsBlock } from './testimonials.block';
import { CtaBlock } from './cta.block';
import { ImageBlock } from './image.block';
import { TextBlock } from './text.block';
import { HeadingBlock } from './heading.block';
import { ButtonBlock } from './button.block';
import { DividerBlock } from './divider.block';
import { PricingBlock } from './pricing.block';
import { FaqBlock } from './faq.block';
import { ContactBlock } from './contact.block';
import { GalleryBlock } from './gallery.block';
import { VideoBlock } from './video.block';
import { StatsBlock } from './stats.block';
import { TeamBlock } from './team.block';
import { CountdownBlock } from './countdown.block';
import { NewsletterBlock } from './newsletter.block';
import { LogosBlock } from './logos.block';
import { FooterBlock } from './footer.block';

const ALIGN_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
];

const COLUMN_OPTIONS = [
  { label: '2 columns', value: '2' },
  { label: '3 columns', value: '3' },
  { label: '4 columns', value: '4' },
];

const ALIGN3_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];

const MOBILE_COLUMN_OPTIONS = [
  { label: '1 column', value: '1' },
  { label: '2 columns', value: '2' },
];

const COLUMNS_1_6_OPTIONS = [1, 2, 3, 4, 5, 6].map((n) => ({
  label: `${n} column${n > 1 ? 's' : ''}`,
  value: String(n),
}));

const SECTION_WIDTH_OPTIONS = [
  { label: 'Contained', value: 'contained' },
  { label: 'Wide', value: 'wide' },
  { label: 'Full width', value: 'full' },
];

const VALIGN_OPTIONS = [
  { label: 'Top', value: 'top' },
  { label: 'Center', value: 'center' },
  { label: 'Bottom', value: 'bottom' },
];

const BUTTON_VARIANT_OPTIONS = [
  { label: 'Filled', value: 'filled' },
  { label: 'Outline', value: 'outline' },
  { label: 'Ghost', value: 'ghost' },
];

const SIZE_OPTIONS = [
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
];

const RADIUS_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
  { label: 'Pill', value: 'full' },
];

const SHADOW_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Subtle', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Strong', value: 'lg' },
];

const LINE_STYLE_OPTIONS = [
  { label: 'Solid', value: 'solid' },
  { label: 'Dashed', value: 'dashed' },
  { label: 'Dotted', value: 'dotted' },
];

const HEADING_LEVEL_OPTIONS = [1, 2, 3, 4, 5, 6].map((n) => ({
  label: `Heading ${n} (H${n})`,
  value: `h${n}`,
}));

const WEIGHT_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Medium', value: 'medium' },
  { label: 'Semibold', value: 'semibold' },
  { label: 'Bold', value: 'bold' },
];

const BX_RADIUS_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
  { label: 'Full', value: 'full' },
];

const BX_WIDTH_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Contained', value: 'contained' },
  { label: 'Wide', value: 'wide' },
];

/**
 * Shared, opt-in appearance controls (background, radius, width, spacing) for
 * any block. Uses the `bx*` prop namespace so it never collides with a block's
 * own settings; the renderer applies them via a wrapper only when set. Each
 * block opts into the subset that's genuinely new for it (no duplicate
 * controls). See blockAppearance() in appearance.ts.
 */
type AppearanceKey = 'bg' | 'radius' | 'width' | 'space';
function appearanceFields(keys: AppearanceKey[]): InspectorField[] {
  const f: InspectorField[] = [];
  if (keys.includes('bg'))
    f.push({
      key: 'bxBg',
      label: 'Background',
      type: 'color',
      group: 'Appearance',
    });
  if (keys.includes('radius'))
    f.push({
      key: 'bxRadius',
      label: 'Rounded corners',
      type: 'select',
      options: BX_RADIUS_OPTIONS,
      group: 'Appearance',
    });
  if (keys.includes('width'))
    f.push({
      key: 'bxWidth',
      label: 'Width',
      type: 'select',
      options: BX_WIDTH_OPTIONS,
      group: 'Appearance',
    });
  if (keys.includes('space')) {
    f.push({
      key: 'bxPadTop',
      label: 'Space top (px)',
      type: 'number',
      group: 'Spacing',
    });
    f.push({
      key: 'bxPadBottom',
      label: 'Space bottom (px)',
      type: 'number',
      group: 'Spacing',
    });
  }
  return f;
}

/** Container blocks render their `children` (handled in block-renderer), so
 * their Component is a no-op placeholder kept only for registry metadata. */
const ContainerPlaceholder = () => null;

/** Blocks implemented through Phase 4 — enough for a full landing page. */
export const BLOCK_REGISTRY: Partial<Record<BlockType, BlockDefinition>> = {
  section: {
    type: 'section',
    label: 'Section',
    category: 'layout',
    icon: Columns3,
    defaultProps: {},
    fields: [
      { key: 'layout', label: 'Layout', type: 'section-layout' },
      {
        key: 'width',
        label: 'Width',
        type: 'select',
        options: SECTION_WIDTH_OPTIONS,
      },
      { key: 'columns', label: 'Column widths', type: 'section-columns' },
      { key: 'gap', label: 'Gap between columns (px)', type: 'number' },
      {
        key: 'paddingY',
        label: 'Top & bottom padding (px)',
        type: 'number',
        advanced: true,
      },
      { key: 'background', label: 'Background', type: 'color', advanced: true },
    ],
    Component: ContainerPlaceholder,
  },
  column: {
    type: 'column',
    label: 'Column',
    category: 'layout',
    icon: Square,
    defaultProps: {},
    fields: [
      { key: 'columnActions', label: 'Column', type: 'column-actions' },
      {
        key: 'verticalAlign',
        label: 'Vertical align',
        type: 'select',
        options: VALIGN_OPTIONS,
      },
      { key: 'hiddenMobile', label: 'Hide on mobile', type: 'toggle' },
      { key: 'padding', label: 'Padding (px)', type: 'number', advanced: true },
      { key: 'background', label: 'Background', type: 'color', advanced: true },
    ],
    Component: ContainerPlaceholder,
  },
  navbar: {
    type: 'navbar',
    label: 'Navbar',
    category: 'layout',
    icon: Navigation,
    defaultProps: {
      brand: 'Brand',
      logo: '',
      logoHeight: 32,
      brandFont: '',
      brandBold: false,
      brandItalic: false,
      brandUnderline: false,
      brandStrike: false,
      brandColor: '',
      brandBg: '',
      links: 'Home | #\nFeatures | #features\nPricing | #pricing',
      ctaLabel: 'Get started',
      ctaHref: '#',
      ctaStyle: 'filled',
      ctaBg: '',
      ctaColor: '',
      secondaryCtaEnabled: false,
      secondaryCtaLabel: 'Sign in',
      secondaryCtaHref: '#',
      secondaryCtaStyle: 'outline',
      secondaryCtaBg: '',
      secondaryCtaColor: '',
      background: '#FFFFFF',
      textColor: '#0F0F12',
      sticky: false,
    },
    fields: [
      { key: 'brand', label: 'Brand & logo', type: 'navbar-brand' },
      { key: 'menu', label: 'Menu links', type: 'menu' },
      { key: 'cta', label: 'Buttons', type: 'navbar-buttons' },
      { key: 'background', label: 'Background', type: 'color' },
      { key: 'textColor', label: 'Text color', type: 'color' },
      { key: 'sticky', label: 'Stick to top', type: 'toggle' },
    ],
    Component: NavbarBlock,
  },
  hero: {
    type: 'hero',
    label: 'Hero',
    category: 'layout',
    icon: Heading,
    defaultProps: {
      headline: 'Your big idea starts here',
      subtext: 'A clear, compelling subheading that explains what you offer.',
      ctaLabel: 'Get started',
      ctaHref: '#',
      secondaryCtaLabel: '',
      secondaryCtaHref: '#',
      align: 'center',
      background: '#0F0F12',
      backgroundImage: '',
      textColor: '#FFFFFF',
    },
    fields: [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'subtext', label: 'Subtext', type: 'textarea' },
      { key: 'ctaLabel', label: 'Primary button', type: 'text' },
      {
        key: 'ctaHref',
        label: 'Primary button link',
        type: 'text',
        hint: 'URL or #anchor',
      },
      { key: 'secondaryCtaLabel', label: 'Secondary button', type: 'text' },
      { key: 'secondaryCtaHref', label: 'Secondary button link', type: 'text' },
      {
        key: 'align',
        label: 'Alignment',
        type: 'select',
        options: ALIGN_OPTIONS,
      },
      { key: 'background', label: 'Background', type: 'color' },
      {
        key: 'backgroundImage',
        label: 'Background image',
        type: 'text',
        hint: 'Image URL — overrides color when set',
      },
      { key: 'textColor', label: 'Text color', type: 'color' },
      ...appearanceFields(['radius', 'width', 'space']),
    ],
    Component: HeroBlock,
  },
  features: {
    type: 'features',
    label: 'Features',
    category: 'content',
    icon: LayoutGrid,
    defaultProps: {
      heading: 'Everything you need',
      subtext: '',
      columns: '3',
      items:
        'Fast | Built for speed and reliability.\nSimple | An interface anyone can use.\nFlexible | Adapts to whatever you build.',
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtext', label: 'Subtext', type: 'textarea' },
      {
        key: 'columns',
        label: 'Columns',
        type: 'select',
        options: COLUMN_OPTIONS,
      },
      {
        key: 'items',
        label: 'Features',
        type: 'textarea',
        hint: 'One per line: Title | Description',
      },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: FeaturesBlock,
  },
  testimonials: {
    type: 'testimonials',
    label: 'Testimonials',
    category: 'content',
    icon: Quote,
    defaultProps: {
      heading: 'Loved by teams everywhere',
      items:
        'This product changed how we work. | Jane Doe | CEO, Acme\nThe best tool we have adopted in years. | John Smith | CTO, Globex',
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      {
        key: 'items',
        label: 'Testimonials',
        type: 'textarea',
        hint: 'One per line: Quote | Author | Role',
      },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: TestimonialsBlock,
  },
  cta: {
    type: 'cta',
    label: 'CTA Banner',
    category: 'layout',
    icon: Megaphone,
    defaultProps: {
      headline: 'Ready to get started?',
      subtext: 'Join thousands of teams building with us.',
      ctaLabel: 'Start free',
      ctaHref: '#',
      background: '#4F6EF7',
      backgroundImage: '',
      textColor: '#FFFFFF',
    },
    fields: [
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'subtext', label: 'Subtext', type: 'textarea' },
      { key: 'ctaLabel', label: 'Button label', type: 'text' },
      {
        key: 'ctaHref',
        label: 'Button link',
        type: 'text',
        hint: 'URL or #anchor',
      },
      { key: 'background', label: 'Background', type: 'color' },
      {
        key: 'backgroundImage',
        label: 'Background image',
        type: 'text',
        hint: 'Image URL — overrides color when set',
      },
      { key: 'textColor', label: 'Text color', type: 'color' },
      ...appearanceFields(['radius', 'width', 'space']),
    ],
    Component: CtaBlock,
  },
  image: {
    type: 'image',
    label: 'Image',
    category: 'media',
    icon: ImageIcon,
    defaultProps: {
      src: '',
      alt: '',
      caption: '',
      link: '',
      width: 'contained',
      rounded: true,
    },
    fields: [
      { key: 'src', label: 'Image', type: 'image' },
      {
        key: 'alt',
        label: 'Alt text',
        type: 'text',
        hint: 'Describe the image for accessibility',
      },
      { key: 'caption', label: 'Caption', type: 'text' },
      {
        key: 'link',
        label: 'Link (optional)',
        type: 'text',
        hint: 'Wrap image in a link',
      },
      {
        key: 'width',
        label: 'Width',
        type: 'select',
        options: [
          { label: 'Contained', value: 'contained' },
          { label: 'Full width', value: 'full' },
        ],
      },
      { key: 'rounded', label: 'Rounded corners', type: 'toggle' },
      ...appearanceFields(['bg', 'space']),
    ],
    Component: ImageBlock,
  },
  text: {
    type: 'text',
    label: 'Text',
    category: 'content',
    icon: Type,
    defaultProps: {
      heading: '',
      content:
        'Write something meaningful here. Click to edit this text block.',
      align: 'left',
    },
    fields: [
      { key: 'heading', label: 'Heading (optional)', type: 'text' },
      { key: 'content', label: 'Content', type: 'textarea' },
      {
        key: 'align',
        label: 'Alignment',
        type: 'select',
        options: ALIGN_OPTIONS,
      },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: TextBlock,
  },
  heading: {
    type: 'heading',
    label: 'Heading',
    category: 'content',
    icon: Heading1,
    defaultProps: {
      text: 'Your heading',
      level: 'h2',
      align: 'left',
      weight: 'bold',
      color: '',
    },
    fields: [
      { key: 'text', label: 'Text', type: 'text', group: 'Content' },
      {
        key: 'level',
        label: 'Level (tag)',
        type: 'select',
        options: HEADING_LEVEL_OPTIONS,
        hint: 'H1–H6 — sets the HTML tag for SEO & accessibility',
        group: 'Content',
      },
      {
        key: 'align',
        label: 'Alignment',
        type: 'select',
        options: ALIGN3_OPTIONS,
        group: 'Style',
      },
      {
        key: 'weight',
        label: 'Weight',
        type: 'select',
        options: WEIGHT_OPTIONS,
        group: 'Style',
      },
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        hint: 'Defaults to your theme text color',
        group: 'Style',
      },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: HeadingBlock,
  },
  button: {
    type: 'button',
    label: 'Button',
    category: 'content',
    icon: MousePointerClick,
    defaultProps: {
      label: 'Get started',
      href: '#',
      newTab: false,
      variant: 'filled',
      size: 'md',
      align: 'left',
      fullWidth: false,
      bg: '#4F6EF7',
      color: '#FFFFFF',
      radius: 'md',
      shadow: 'none',
    },
    fields: [
      { key: 'label', label: 'Label', type: 'text', group: 'Content' },
      {
        key: 'href',
        label: 'Link',
        type: 'text',
        hint: 'URL or #anchor',
        group: 'Content',
      },
      {
        key: 'newTab',
        label: 'Open in new tab',
        type: 'toggle',
        group: 'Content',
      },
      {
        key: 'variant',
        label: 'Style',
        type: 'select',
        options: BUTTON_VARIANT_OPTIONS,
        group: 'Style',
      },
      {
        key: 'size',
        label: 'Size',
        type: 'select',
        options: SIZE_OPTIONS,
        group: 'Style',
      },
      {
        key: 'align',
        label: 'Alignment',
        type: 'select',
        options: ALIGN3_OPTIONS,
        group: 'Style',
      },
      { key: 'fullWidth', label: 'Full width', type: 'toggle', group: 'Style' },
      { key: 'bg', label: 'Button color', type: 'color', group: 'Colors' },
      { key: 'color', label: 'Text color', type: 'color', group: 'Colors' },
      {
        key: 'radius',
        label: 'Rounded corners',
        type: 'select',
        options: RADIUS_OPTIONS,
        group: 'Effects',
      },
      {
        key: 'shadow',
        label: 'Shadow',
        type: 'select',
        options: SHADOW_OPTIONS,
        group: 'Effects',
      },
      ...appearanceFields(['space']),
    ],
    Component: ButtonBlock,
  },
  divider: {
    type: 'divider',
    label: 'Divider',
    category: 'content',
    icon: SeparatorHorizontal,
    defaultProps: {
      text: '',
      position: 'center',
      color: '#E5E7EB',
      textColor: '#6B7280',
      thickness: 1,
      lineStyle: 'solid',
      spacingY: 24,
    },
    fields: [
      {
        key: 'text',
        label: 'Label (optional)',
        type: 'text',
        hint: 'Leave empty for a plain line',
        group: 'Label',
      },
      {
        key: 'position',
        label: 'Label position',
        type: 'select',
        options: ALIGN3_OPTIONS,
        group: 'Label',
      },
      { key: 'textColor', label: 'Label color', type: 'color', group: 'Label' },
      { key: 'color', label: 'Line color', type: 'color', group: 'Line' },
      {
        key: 'thickness',
        label: 'Thickness (px)',
        type: 'number',
        group: 'Line',
      },
      {
        key: 'lineStyle',
        label: 'Line style',
        type: 'select',
        options: LINE_STYLE_OPTIONS,
        group: 'Line',
      },
      {
        key: 'spacingY',
        label: 'Vertical space (px)',
        type: 'number',
        group: 'Spacing',
      },
      ...appearanceFields(['space']),
    ],
    Component: DividerBlock,
  },
  footer: {
    type: 'footer',
    label: 'Footer',
    category: 'layout',
    icon: PanelBottom,
    defaultProps: {
      brand: 'Brand',
      tagline: 'Building the web, one block at a time.',
      links: 'Privacy, Terms, Contact',
      social: 'Twitter, GitHub, LinkedIn',
      text: `© ${new Date().getFullYear()} All rights reserved.`,
      columns: '3',
      columnsMobile: '2',
    },
    fields: [
      { key: 'brand', label: 'Brand name', type: 'text' },
      { key: 'tagline', label: 'Tagline', type: 'text' },
      {
        key: 'links',
        label: 'Links',
        type: 'textarea',
        hint: 'One per line: Label | URL',
      },
      {
        key: 'social',
        label: 'Social',
        type: 'textarea',
        hint: 'One per line: Label | URL',
      },
      { key: 'text', label: 'Copyright text', type: 'text' },
      {
        key: 'columns',
        label: 'Columns (desktop)',
        type: 'select',
        options: COLUMNS_1_6_OPTIONS,
      },
      {
        key: 'columnsMobile',
        label: 'Columns (mobile)',
        type: 'select',
        options: MOBILE_COLUMN_OPTIONS,
      },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: FooterBlock,
  },

  pricing: {
    type: 'pricing',
    label: 'Pricing',
    category: 'content',
    icon: CreditCard,
    defaultProps: {
      heading: 'Simple, transparent pricing',
      subtext: '',
      highlightIndex: 1,
      items:
        'Starter | $9 | /mo | 1 project; Email support; 1 GB storage\nPro | $29 | /mo | Unlimited projects; Priority support; 50 GB\nTeam | $99 | /mo | Everything in Pro; SSO; 500 GB',
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtext', label: 'Subtext', type: 'textarea' },
      {
        key: 'highlightIndex',
        label: 'Highlight tier (0-based)',
        type: 'number',
      },
      {
        key: 'items',
        label: 'Tiers',
        type: 'textarea',
        hint: 'Per line: Name | Price | Period | feat1; feat2 | buttonURL',
      },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: PricingBlock,
  },
  faq: {
    type: 'faq',
    label: 'FAQ',
    category: 'content',
    icon: HelpCircle,
    defaultProps: {
      heading: 'Frequently asked questions',
      items:
        'How does the free trial work? | Full access for 14 days, no card required.\nCan I cancel anytime? | Yes — cancel in one click.\nDo you offer refunds? | 30-day money-back guarantee.',
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      {
        key: 'items',
        label: 'Questions',
        type: 'textarea',
        hint: 'Per line: Question | Answer',
      },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: FaqBlock,
  },
  stats: {
    type: 'stats',
    label: 'Stats',
    category: 'content',
    icon: BarChart3,
    defaultProps: {
      heading: '',
      columns: '4',
      items:
        '10k+ | Active users\n99.9% | Uptime\n4.9/5 | Rating\n24/7 | Support',
    },
    fields: [
      { key: 'heading', label: 'Heading (optional)', type: 'text' },
      {
        key: 'columns',
        label: 'Columns',
        type: 'select',
        options: COLUMN_OPTIONS,
      },
      {
        key: 'items',
        label: 'Stats',
        type: 'textarea',
        hint: 'Per line: Value | Label',
      },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: StatsBlock,
  },
  team: {
    type: 'team',
    label: 'Team',
    category: 'content',
    icon: Users,
    defaultProps: {
      heading: 'Meet the team',
      items:
        'Alex Rivera | Founder & CEO |\nSam Chen | Head of Product |\nJordan Lee | Lead Engineer |',
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      {
        key: 'items',
        label: 'Members',
        type: 'textarea',
        hint: 'Per line: Name | Role | Image URL (optional)',
      },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: TeamBlock,
  },
  contact: {
    type: 'contact',
    label: 'Contact',
    category: 'content',
    icon: Mail,
    defaultProps: {
      heading: 'Get in touch',
      subtext: 'We usually reply within one business day.',
      buttonLabel: 'Send message',
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtext', label: 'Subtext', type: 'textarea' },
      { key: 'buttonLabel', label: 'Button label', type: 'text' },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: ContactBlock,
  },
  newsletter: {
    type: 'newsletter',
    label: 'Newsletter',
    category: 'content',
    icon: Send,
    defaultProps: {
      heading: 'Stay in the loop',
      subtext: 'Get product updates and tips in your inbox.',
      placeholder: 'you@example.com',
      buttonLabel: 'Subscribe',
      background: '#0F0F12',
      textColor: '#FFFFFF',
      align: 'center',
      alignMobile: 'center',
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtext', label: 'Subtext', type: 'textarea' },
      { key: 'placeholder', label: 'Input placeholder', type: 'text' },
      { key: 'buttonLabel', label: 'Button label', type: 'text' },
      { key: 'background', label: 'Background', type: 'color' },
      { key: 'textColor', label: 'Text color', type: 'color' },
      {
        key: 'align',
        label: 'Alignment (desktop)',
        type: 'select',
        options: ALIGN3_OPTIONS,
      },
      {
        key: 'alignMobile',
        label: 'Alignment (mobile)',
        type: 'select',
        options: ALIGN3_OPTIONS,
      },
      ...appearanceFields(['radius', 'width', 'space']),
    ],
    Component: NewsletterBlock,
  },
  gallery: {
    type: 'gallery',
    label: 'Gallery',
    category: 'media',
    icon: Images,
    defaultProps: {
      heading: '',
      columns: '3',
      columnsMobile: '2',
      images: '',
    },
    fields: [
      { key: 'heading', label: 'Heading (optional)', type: 'text' },
      {
        key: 'columns',
        label: 'Columns (desktop)',
        type: 'select',
        options: COLUMN_OPTIONS,
      },
      {
        key: 'columnsMobile',
        label: 'Columns (mobile)',
        type: 'select',
        options: MOBILE_COLUMN_OPTIONS,
      },
      {
        key: 'images',
        label: 'Image URLs',
        type: 'textarea',
        hint: 'One URL per line',
      },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: GalleryBlock,
  },
  video: {
    type: 'video',
    label: 'Video',
    category: 'media',
    icon: VideoIcon,
    defaultProps: { url: '', caption: '' },
    fields: [
      {
        key: 'url',
        label: 'Video URL',
        type: 'text',
        hint: 'YouTube or Vimeo link',
      },
      { key: 'caption', label: 'Caption', type: 'text' },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: VideoBlock,
  },
  countdown: {
    type: 'countdown',
    label: 'Countdown',
    category: 'advanced',
    icon: Timer,
    defaultProps: {
      heading: 'Launching soon',
      targetDate: '2026-12-31',
      expiredText: "We're live!",
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'targetDate', label: 'Target date', type: 'date' },
      { key: 'expiredText', label: 'Text when finished', type: 'text' },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: CountdownBlock,
  },
  logos: {
    type: 'logos',
    label: 'Logo Cloud',
    category: 'content',
    icon: Building2,
    defaultProps: {
      heading: 'Trusted by leading teams',
      items: 'Acme, Globex, Initech, Umbrella, Hooli, Vehement',
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      {
        key: 'items',
        label: 'Logos',
        type: 'textarea',
        hint: 'Names or image URLs, comma- or line-separated',
      },
      ...appearanceFields(['bg', 'radius', 'width', 'space']),
    ],
    Component: LogosBlock,
  },
};

/** Definitions in palette display order (landing-page flow). */
export const PALETTE_BLOCKS: BlockDefinition[] = (
  [
    'navbar',
    'hero',
    'features',
    'stats',
    'logos',
    'testimonials',
    'pricing',
    'faq',
    'team',
    'gallery',
    'video',
    'cta',
    'newsletter',
    'countdown',
    'contact',
    'image',
    'heading',
    'text',
    'button',
    'divider',
    'footer',
  ] as BlockType[]
).map((type) => BLOCK_REGISTRY[type]!);

export function getBlockDefinition(
  type: BlockType,
): BlockDefinition | undefined {
  return BLOCK_REGISTRY[type];
}

/** Build a fresh block instance from a registered type. */
export function createBlock(type: BlockType): Block {
  const def = BLOCK_REGISTRY[type];
  return {
    id: shortId('blk'),
    type,
    props: { ...(def?.defaultProps ?? {}) },
    styles: {},
    locked: false,
    visible: true,
    responsive: { desktop: {}, tablet: {}, mobile: {} },
  };
}

/** A fresh empty column (a box inside a section). */
export function createColumn(): Block {
  return {
    id: shortId('col'),
    type: 'column',
    props: {},
    styles: {},
    locked: false,
    visible: true,
    responsive: { desktop: {}, tablet: {}, mobile: {} },
    children: [],
  };
}

/** A fresh Section pre-seeded with one empty column per box in the layout. */
export function createSection(layoutId: string): Block {
  const layout = layoutById(layoutId) ?? SECTION_LAYOUTS[1]!;
  return {
    id: shortId('sec'),
    type: 'section',
    props: {
      layout: layout.id,
      columns: layout.columns,
      gap: 24,
      width: 'contained',
      paddingY: 48,
      mobile: { mode: 'auto' },
    },
    styles: {},
    locked: false,
    visible: true,
    responsive: { desktop: {}, tablet: {}, mobile: {} },
    children: layout.columns.map(() => createColumn()),
  };
}
