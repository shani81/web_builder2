import { now, shortId } from '@buildr/utils';
import type {
  Block,
  BlockProps,
  BlockType,
  Page,
  SiteTheme,
  Template,
  TemplateCategory,
} from '@buildr/types';

/**
 * Templates are app-provided seed content, kept in code for type safety (the
 * "JSON store" of the spec — structured, versioned data). `useTemplate` clones
 * a template into a real user Site with fresh ids.
 */

function block(type: BlockType, props: BlockProps): Block {
  return {
    id: shortId('blk'),
    type,
    props,
    styles: {},
    locked: false,
    visible: true,
    responsive: { desktop: {}, tablet: {}, mobile: {} },
  };
}

function homePage(blocks: Block[]): Page {
  const ts = now();
  return {
    id: shortId('page'),
    siteId: '',
    title: 'Home',
    slug: 'home',
    blocks,
    seo: { metaTitle: 'Home', metaDescription: '', noIndex: false },
    isHome: true,
    createdAt: ts,
    updatedAt: ts,
  };
}

interface TemplateSeed {
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  theme: SiteTheme;
  blocks: Block[];
}

function makeTemplate(seed: TemplateSeed): Template {
  const ts = now();
  return {
    id: shortId('tpl'),
    name: seed.name,
    description: seed.description,
    category: seed.category,
    tags: seed.tags,
    thumbnailUrl: '',
    theme: seed.theme,
    pages: [homePage(seed.blocks)],
    isPremium: false,
    usageCount: 0,
    createdAt: ts,
    updatedAt: ts,
  };
}

const theme = (
  primary: string,
  bg: string,
  text: string,
  heading = 'Inter',
): SiteTheme => ({
  primaryColor: primary,
  secondaryColor: '#0F0F12',
  accentColor: '#22C55E',
  backgroundColor: bg,
  textColor: text,
  fontHeading: heading,
  fontBody: 'Inter',
  borderRadius: 'md',
  spacing: 'normal',
});

export const TEMPLATES: Template[] = [
  // ── Business ──────────────────────────────────────────────────────────
  makeTemplate({
    name: 'Apex Consulting',
    description: 'A confident, corporate site for consultancies and advisors.',
    category: 'business',
    tags: ['consulting', 'corporate', 'agency', 'b2b'],
    theme: theme('#2563EB', '#FFFFFF', '#0F172A'),
    blocks: [
      block('navbar', {
        brand: 'Apex',
        links: 'Services, About, Insights, Contact',
        ctaLabel: 'Book a call',
        sticky: true,
      }),
      block('hero', {
        headline: 'Strategy that moves the needle',
        subtext:
          'We help ambitious companies grow with clear, data-driven strategy and hands-on execution.',
        ctaLabel: 'Start a project',
        secondaryCtaLabel: 'See our work',
        align: 'left',
        background: '#0F172A',
        textColor: '#FFFFFF',
      }),
      block('features', {
        heading: 'What we do',
        columns: '3',
        items:
          'Strategy | Roadmaps grounded in real market data.\nOperations | Process design that scales with you.\nGrowth | Acquisition and retention that compounds.',
      }),
      block('testimonials', {
        heading: 'Trusted by leaders',
        items:
          'Apex doubled our pipeline in two quarters. | Maria Lind | COO, Nordic Retail\nThe most pragmatic advisors we have worked with. | Tom Reyes | CEO, Vector',
      }),
      block('cta', {
        headline: "Let's build your next chapter",
        subtext: 'Book a free 30-minute strategy call.',
        ctaLabel: 'Book a call',
        background: '#2563EB',
        textColor: '#FFFFFF',
      }),
      block('footer', {
        brand: 'Apex',
        tagline: 'Strategy. Operations. Growth.',
        links: 'Services, About, Insights',
        social: 'LinkedIn, Twitter',
        text: '© 2026 Apex Consulting.',
      }),
    ],
  }),
  makeTemplate({
    name: 'Northwind Agency',
    description: 'A bold creative-agency layout with punchy color.',
    category: 'business',
    tags: ['agency', 'creative', 'marketing', 'studio'],
    theme: theme('#F97316', '#FFFFFF', '#111827'),
    blocks: [
      block('navbar', {
        brand: 'Northwind',
        links: 'Work, Services, Studio, Contact',
        ctaLabel: "Let's talk",
        sticky: true,
      }),
      block('hero', {
        headline: 'We make brands impossible to ignore',
        subtext: 'Branding, web, and campaigns for companies with big ambitions.',
        ctaLabel: 'See our work',
        align: 'center',
        background: '#111827',
        textColor: '#FFFFFF',
      }),
      block('features', {
        heading: 'Services',
        columns: '4',
        items:
          'Brand | Identity that sticks.\nWeb | Sites that convert.\nContent | Stories that spread.\nAds | Campaigns that perform.',
      }),
      block('cta', {
        headline: 'Have a project in mind?',
        subtext: 'We reply within one business day.',
        ctaLabel: 'Start a project',
        background: '#F97316',
        textColor: '#111827',
      }),
      block('footer', {
        brand: 'Northwind',
        tagline: 'A creative agency.',
        links: 'Work, Services, Studio',
        social: 'Instagram, Dribbble',
        text: '© 2026 Northwind.',
      }),
    ],
  }),

  // ── Portfolio ─────────────────────────────────────────────────────────
  makeTemplate({
    name: 'Mono Portfolio',
    description: 'A minimal black-and-white portfolio for designers & devs.',
    category: 'portfolio',
    tags: ['portfolio', 'minimal', 'designer', 'developer', 'personal'],
    theme: theme('#111111', '#FFFFFF', '#111111'),
    blocks: [
      block('navbar', {
        brand: 'Jordan Vale',
        links: 'Work, About, Contact',
        ctaLabel: 'Resume',
      }),
      block('hero', {
        headline: 'Designer & front-end developer',
        subtext: 'I craft clean, accessible interfaces for products people love.',
        ctaLabel: 'View work',
        align: 'left',
        background: '#FFFFFF',
        textColor: '#111111',
      }),
      block('text', {
        heading: 'About',
        content:
          'Ten years turning complex problems into simple, beautiful experiences. Previously at two startups and a design studio.',
        align: 'left',
      }),
      block('features', {
        heading: 'Selected work',
        columns: '2',
        items:
          'Atlas | Design system for a fintech app.\nPulse | Marketing site and brand refresh.',
      }),
      block('footer', {
        brand: 'Jordan Vale',
        tagline: 'Available for freelance.',
        links: 'Work, About',
        social: 'GitHub, Dribbble, LinkedIn',
        text: '© 2026 Jordan Vale.',
      }),
    ],
  }),
  makeTemplate({
    name: 'Studio Lens',
    description: 'A photography portfolio that puts images first.',
    category: 'portfolio',
    tags: ['portfolio', 'photography', 'gallery', 'creative'],
    theme: theme('#9333EA', '#0B0B0F', '#F4F4F5'),
    blocks: [
      block('navbar', {
        brand: 'Studio Lens',
        links: 'Galleries, Prints, About',
        ctaLabel: 'Hire me',
        background: '#0B0B0F',
        textColor: '#F4F4F5',
      }),
      block('hero', {
        headline: 'Light, framed.',
        subtext: 'Portrait and landscape photography from around the world.',
        ctaLabel: 'View galleries',
        align: 'center',
        background: '#0B0B0F',
        textColor: '#F4F4F5',
      }),
      block('image', {
        src: '',
        alt: 'Featured photograph',
        caption: 'Reykjavík, 2025',
        width: 'full',
        rounded: false,
      }),
      block('cta', {
        headline: 'Prints now available',
        subtext: 'Museum-quality prints shipped worldwide.',
        ctaLabel: 'Shop prints',
        background: '#9333EA',
        textColor: '#FFFFFF',
      }),
      block('footer', {
        brand: 'Studio Lens',
        tagline: 'Photography by Sam Okafor.',
        links: 'Galleries, Prints',
        social: 'Instagram, Behance',
        text: '© 2026 Studio Lens.',
      }),
    ],
  }),

  // ── Restaurant ────────────────────────────────────────────────────────
  makeTemplate({
    name: 'Trattoria Bella',
    description: 'A warm, inviting site for restaurants and cafés.',
    category: 'restaurant',
    tags: ['restaurant', 'food', 'italian', 'menu', 'cafe'],
    theme: theme('#B91C1C', '#FFFBF5', '#1C1917'),
    blocks: [
      block('navbar', {
        brand: 'Trattoria Bella',
        links: 'Menu, Story, Reservations',
        ctaLabel: 'Book a table',
        sticky: true,
        background: '#FFFBF5',
        textColor: '#1C1917',
      }),
      block('hero', {
        headline: 'Authentic Italian, made with love',
        subtext: 'Family recipes, fresh pasta, and a cellar worth lingering over.',
        ctaLabel: 'View menu',
        secondaryCtaLabel: 'Reserve',
        align: 'center',
        background: '#1C1917',
        textColor: '#FFFBF5',
      }),
      block('features', {
        heading: 'Why guests love us',
        columns: '3',
        items:
          'Fresh pasta | Made by hand every morning.\nWood-fired | Pizza from a 400°C oven.\nLocal wine | A curated regional cellar.',
      }),
      block('cta', {
        headline: 'Join us for dinner',
        subtext: 'Open Tue–Sun, 5pm–11pm.',
        ctaLabel: 'Book a table',
        background: '#B91C1C',
        textColor: '#FFFFFF',
      }),
      block('footer', {
        brand: 'Trattoria Bella',
        tagline: 'Buon appetito.',
        links: 'Menu, Story, Reservations',
        social: 'Instagram, Facebook',
        text: '© 2026 Trattoria Bella.',
      }),
    ],
  }),
  makeTemplate({
    name: 'Sushi Zen',
    description: 'A clean, modern site for sushi bars and Japanese dining.',
    category: 'restaurant',
    tags: ['restaurant', 'sushi', 'japanese', 'food', 'menu'],
    theme: theme('#0F766E', '#FFFFFF', '#0F172A'),
    blocks: [
      block('navbar', {
        brand: 'Sushi Zen',
        links: 'Menu, Omakase, Location',
        ctaLabel: 'Reserve',
        sticky: true,
      }),
      block('hero', {
        headline: 'Sushi, perfected',
        subtext: 'Omakase crafted nightly by chef Aoki from the day’s best catch.',
        ctaLabel: 'Reserve a seat',
        align: 'center',
        background: '#0F172A',
        textColor: '#FFFFFF',
      }),
      block('testimonials', {
        heading: 'What diners say',
        items:
          'The best omakase outside Tokyo. | Lena P. | Regular\nEvery piece was a small masterpiece. | David K. | Food critic',
      }),
      block('cta', {
        headline: 'Limited seats nightly',
        subtext: 'Book early — the counter fills fast.',
        ctaLabel: 'Reserve',
        background: '#0F766E',
        textColor: '#FFFFFF',
      }),
      block('footer', {
        brand: 'Sushi Zen',
        tagline: 'Omakase & sake.',
        links: 'Menu, Omakase, Location',
        social: 'Instagram',
        text: '© 2026 Sushi Zen.',
      }),
    ],
  }),

  // ── SaaS ──────────────────────────────────────────────────────────────
  makeTemplate({
    name: 'FlowKit',
    description: 'A crisp product landing page for SaaS and apps.',
    category: 'saas',
    tags: ['saas', 'startup', 'product', 'app', 'software'],
    theme: theme('#4F6EF7', '#FFFFFF', '#0F0F12'),
    blocks: [
      block('navbar', {
        brand: 'FlowKit',
        links: 'Features, Pricing, Docs, Blog',
        ctaLabel: 'Start free',
        sticky: true,
      }),
      block('hero', {
        headline: 'Ship your workflow in minutes',
        subtext:
          'FlowKit gives your team automations, dashboards, and integrations out of the box.',
        ctaLabel: 'Start free',
        secondaryCtaLabel: 'Watch demo',
        align: 'center',
        background: '#0F0F12',
        textColor: '#FFFFFF',
      }),
      block('features', {
        heading: 'Everything your team needs',
        columns: '3',
        items:
          'Automations | Build flows without code.\nDashboards | Real-time metrics at a glance.\nIntegrations | 100+ tools, one click.',
      }),
      block('testimonials', {
        heading: 'Teams ship faster with FlowKit',
        items:
          'We cut busywork by 40%. | Priya N. | Head of Ops, Vola\nSetup took an afternoon. | Marcus T. | CTO, Bound',
      }),
      block('cta', {
        headline: 'Start building today',
        subtext: 'Free for up to 5 teammates. No credit card.',
        ctaLabel: 'Create account',
        background: '#4F6EF7',
        textColor: '#FFFFFF',
      }),
      block('footer', {
        brand: 'FlowKit',
        tagline: 'Workflows, simplified.',
        links: 'Features, Pricing, Docs',
        social: 'Twitter, GitHub',
        text: '© 2026 FlowKit, Inc.',
      }),
    ],
  }),
  makeTemplate({
    name: 'DataPulse',
    description: 'An analytics-focused SaaS layout with a technical feel.',
    category: 'saas',
    tags: ['saas', 'analytics', 'data', 'dashboard', 'b2b'],
    theme: theme('#06B6D4', '#0B1120', '#E2E8F0'),
    blocks: [
      block('navbar', {
        brand: 'DataPulse',
        links: 'Product, Pricing, Customers',
        ctaLabel: 'Get a demo',
        sticky: true,
        background: '#0B1120',
        textColor: '#E2E8F0',
      }),
      block('hero', {
        headline: 'See every metric that matters',
        subtext: 'Real-time analytics for product teams who move fast.',
        ctaLabel: 'Get a demo',
        align: 'left',
        background: '#0B1120',
        textColor: '#E2E8F0',
      }),
      block('features', {
        heading: 'Built for scale',
        columns: '3',
        items:
          'Real-time | Sub-second event ingestion.\nAlerts | Anomaly detection built in.\nAPIs | Query everything programmatically.',
      }),
      block('cta', {
        headline: 'Put your data to work',
        subtext: 'Start a 14-day trial — full access.',
        ctaLabel: 'Start trial',
        background: '#06B6D4',
        textColor: '#0B1120',
      }),
      block('footer', {
        brand: 'DataPulse',
        tagline: 'Analytics for builders.',
        links: 'Product, Pricing, Customers',
        social: 'Twitter, GitHub',
        text: '© 2026 DataPulse.',
      }),
    ],
  }),

  // ── Event ─────────────────────────────────────────────────────────────
  makeTemplate({
    name: 'Summit 2026',
    description: 'A high-energy landing page for conferences and events.',
    category: 'event',
    tags: ['event', 'conference', 'summit', 'tickets', 'meetup'],
    theme: theme('#DB2777', '#0A0A0A', '#FAFAFA'),
    blocks: [
      block('navbar', {
        brand: 'Summit ’26',
        links: 'Speakers, Schedule, Venue',
        ctaLabel: 'Get tickets',
        sticky: true,
        background: '#0A0A0A',
        textColor: '#FAFAFA',
      }),
      block('hero', {
        headline: 'The future of product, in one room',
        subtext: 'Two days, 40 speakers, 1,200 builders. June 12–13, Stockholm.',
        ctaLabel: 'Get tickets',
        secondaryCtaLabel: 'View schedule',
        align: 'center',
        background: '#0A0A0A',
        textColor: '#FAFAFA',
      }),
      block('features', {
        heading: 'Why attend',
        columns: '3',
        items:
          'Learn | Talks from industry leaders.\nConnect | 1,200 peers to meet.\nBuild | Hands-on workshops.',
      }),
      block('cta', {
        headline: 'Early-bird tickets end soon',
        subtext: 'Save 30% through April 30.',
        ctaLabel: 'Get tickets',
        background: '#DB2777',
        textColor: '#FFFFFF',
      }),
      block('footer', {
        brand: 'Summit ’26',
        tagline: 'See you in Stockholm.',
        links: 'Speakers, Schedule, Venue',
        social: 'Twitter, LinkedIn',
        text: '© 2026 Summit.',
      }),
    ],
  }),
  makeTemplate({
    name: 'WedDay',
    description: 'An elegant single-page site for weddings and celebrations.',
    category: 'event',
    tags: ['event', 'wedding', 'celebration', 'rsvp', 'personal'],
    theme: theme('#A16207', '#FFFDF7', '#3F2C12', 'Inter'),
    blocks: [
      block('navbar', {
        brand: 'A & J',
        links: 'Story, Details, RSVP',
        ctaLabel: 'RSVP',
        background: '#FFFDF7',
        textColor: '#3F2C12',
      }),
      block('hero', {
        headline: 'Amelia & James',
        subtext: 'We’re getting married — September 20, 2026, in Tuscany.',
        ctaLabel: 'RSVP',
        align: 'center',
        background: '#3F2C12',
        textColor: '#FFFDF7',
      }),
      block('text', {
        heading: 'Our story',
        content:
          'From a chance meeting in a tiny bookstore to a life together — we can’t wait to celebrate with the people we love.',
        align: 'center',
      }),
      block('cta', {
        headline: 'Will you join us?',
        subtext: 'Kindly respond by July 1.',
        ctaLabel: 'RSVP now',
        background: '#A16207',
        textColor: '#FFFFFF',
      }),
      block('footer', {
        brand: 'A & J',
        tagline: 'With love.',
        links: 'Story, Details, RSVP',
        social: 'Instagram',
        text: '© 2026 Amelia & James.',
      }),
    ],
  }),
];
