import {
  BarChart3,
  Building2,
  CreditCard,
  Heading,
  HelpCircle,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  Mail,
  Megaphone,
  Navigation,
  PanelBottom,
  Quote,
  Send,
  Timer,
  Type,
  Users,
  Video as VideoIcon,
} from 'lucide-react';
import type { Block, BlockType } from '@buildr/types';
import { shortId } from '@buildr/utils';
import type { BlockDefinition } from './types';
import { NavbarBlock } from './navbar.block';
import { HeroBlock } from './hero.block';
import { FeaturesBlock } from './features.block';
import { TestimonialsBlock } from './testimonials.block';
import { CtaBlock } from './cta.block';
import { ImageBlock } from './image.block';
import { TextBlock } from './text.block';
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

/** Blocks implemented through Phase 4 — enough for a full landing page. */
export const BLOCK_REGISTRY: Partial<Record<BlockType, BlockDefinition>> = {
  navbar: {
    type: 'navbar',
    label: 'Navbar',
    category: 'layout',
    icon: Navigation,
    defaultProps: {
      brand: 'Brand',
      links: 'Home | #\nFeatures | #features\nPricing | #pricing',
      ctaLabel: 'Get started',
      ctaHref: '#',
      background: '#FFFFFF',
      textColor: '#0F0F12',
      sticky: false,
    },
    fields: [
      { key: 'brand', label: 'Brand name', type: 'text' },
      { key: 'menu', label: 'Menu links', type: 'menu' },
      { key: 'ctaLabel', label: 'Button label', type: 'text' },
      { key: 'ctaHref', label: 'Button link', type: 'text', hint: 'URL or #anchor' },
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
      { key: 'ctaHref', label: 'Primary button link', type: 'text', hint: 'URL or #anchor' },
      { key: 'secondaryCtaLabel', label: 'Secondary button', type: 'text' },
      { key: 'secondaryCtaHref', label: 'Secondary button link', type: 'text' },
      { key: 'align', label: 'Alignment', type: 'select', options: ALIGN_OPTIONS },
      { key: 'background', label: 'Background', type: 'color' },
      {
        key: 'backgroundImage',
        label: 'Background image',
        type: 'text',
        hint: 'Image URL — overrides color when set',
      },
      { key: 'textColor', label: 'Text color', type: 'color' },
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
      { key: 'columns', label: 'Columns', type: 'select', options: COLUMN_OPTIONS },
      {
        key: 'items',
        label: 'Features',
        type: 'textarea',
        hint: 'One per line: Title | Description',
      },
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
      { key: 'ctaHref', label: 'Button link', type: 'text', hint: 'URL or #anchor' },
      { key: 'background', label: 'Background', type: 'color' },
      {
        key: 'backgroundImage',
        label: 'Background image',
        type: 'text',
        hint: 'Image URL — overrides color when set',
      },
      { key: 'textColor', label: 'Text color', type: 'color' },
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
      { key: 'link', label: 'Link (optional)', type: 'text', hint: 'Wrap image in a link' },
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
      content: 'Write something meaningful here. Click to edit this text block.',
      align: 'left',
    },
    fields: [
      { key: 'heading', label: 'Heading (optional)', type: 'text' },
      { key: 'content', label: 'Content', type: 'textarea' },
      { key: 'align', label: 'Alignment', type: 'select', options: ALIGN_OPTIONS },
    ],
    Component: TextBlock,
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
      { key: 'highlightIndex', label: 'Highlight tier (0-based)', type: 'number' },
      {
        key: 'items',
        label: 'Tiers',
        type: 'textarea',
        hint: 'Per line: Name | Price | Period | feat1; feat2 | buttonURL',
      },
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
      items: '10k+ | Active users\n99.9% | Uptime\n4.9/5 | Rating\n24/7 | Support',
    },
    fields: [
      { key: 'heading', label: 'Heading (optional)', type: 'text' },
      { key: 'columns', label: 'Columns', type: 'select', options: COLUMN_OPTIONS },
      {
        key: 'items',
        label: 'Stats',
        type: 'textarea',
        hint: 'Per line: Value | Label',
      },
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
    },
    fields: [
      { key: 'heading', label: 'Heading', type: 'text' },
      { key: 'subtext', label: 'Subtext', type: 'textarea' },
      { key: 'placeholder', label: 'Input placeholder', type: 'text' },
      { key: 'buttonLabel', label: 'Button label', type: 'text' },
      { key: 'background', label: 'Background', type: 'color' },
      { key: 'textColor', label: 'Text color', type: 'color' },
    ],
    Component: NewsletterBlock,
  },
  gallery: {
    type: 'gallery',
    label: 'Gallery',
    category: 'media',
    icon: Images,
    defaultProps: { heading: '', columns: '3', images: '' },
    fields: [
      { key: 'heading', label: 'Heading (optional)', type: 'text' },
      { key: 'columns', label: 'Columns', type: 'select', options: COLUMN_OPTIONS },
      {
        key: 'images',
        label: 'Image URLs',
        type: 'textarea',
        hint: 'One URL per line',
      },
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
    'text',
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
