import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import MarqueeText from '../../components/MarqueeText';
import ProductGrid from '../../app/home/components/ProductGrid';
import CategoryPills from '../../app/home/components/CategoryPills';
import LandscapeImage from '@/components/LandscapeImage';

export const componentRegistry = {
  Navbar: {
    component: Navbar,
    label: 'Navigation Bar',
    category: 'Layout',
    props: {
      logo: {
        type: 'image',
        label: 'Logo',
        default: '/logo.png'
      },
      colors: {
        background: {
          type: 'color',
          label: 'Background Color',
          default: '#ffffff'
        },
        text: {
          type: 'color',
          label: 'Text Color',
          default: '#000000'
        }
      },
      sticky: {
        type: 'boolean',
        label: 'Sticky Navigation',
        default: true
      }
    }
  },
  MarqueeText: {
    component: MarqueeText,
    label: 'Marquee Text',
    category: 'Content',
    props: {
      text: {
        type: 'text',
        label: 'Text Content',
        default: 'Announcement text here'
      },
      speed: {
        type: 'number',
        label: 'Scroll Speed',
        default: 15,
        min: 5,
        max: 50
      }
    }
  },
  LandscapeImage: {
    component: LandscapeImage,
    label: 'Landscape Image',
    category: 'Media',
    props: {
      src: {
        type: 'image',
        label: 'Image',
        default: '/placeholders/landscape-placeholder.svg'
      },
      alt: {
        type: 'text',
        label: 'Alt Text',
        default: 'Landscape image'
      }
    }
  }
  // Add more components...
}; 