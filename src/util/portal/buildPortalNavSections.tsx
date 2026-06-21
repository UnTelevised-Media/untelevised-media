import {
  Newspaper,
  BookOpen,
  Mail,
  User,
  FileText,
  Library,
  DollarSign,
  ShoppingBag,
  ClipboardList,
  Star,
  MessageSquare,
  ShieldAlert,
  Users,
  UserCircle,
  Database,
} from 'lucide-react';
import type { PortalRole } from '@/lib/auth/roles-utils';

type NavLink = { href: string; label: string; icon: React.ReactNode };
export type NavSection = { id: string; label: string; icon: React.ReactNode; links: NavLink[] };

export default function buildPortalNavSections(
  isEditorPlus: boolean,
  role: PortalRole | null
): NavSection[] {
  if (role === 'sales') {
    return [
      {
        id: 'books',
        label: 'Books',
        icon: <BookOpen className='h-3.5 w-3.5' />,
        links: [
          { href: '/portal/sales', label: 'Sales', icon: <ShoppingBag className='h-3.5 w-3.5' /> },
        ],
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: <User className='h-3.5 w-3.5' />,
        links: [
          {
            href: '/portal/profile',
            label: 'My Profile',
            icon: <UserCircle className='h-3.5 w-3.5' />,
          },
        ],
      },
    ];
  }

  const newsLinks: NavLink[] = [
    { href: '/portal/articles', label: 'Articles', icon: <FileText className='h-3.5 w-3.5' /> },
    { href: '/portal/sources', label: 'Sources', icon: <Database className='h-3.5 w-3.5' /> },
  ];

  const booksLinks: NavLink[] = [
    { href: '/portal/library', label: 'Library', icon: <Library className='h-3.5 w-3.5' /> },
    { href: '/portal/earnings', label: 'Earnings', icon: <DollarSign className='h-3.5 w-3.5' /> },
    { href: '/portal/sales', label: 'Sales', icon: <ShoppingBag className='h-3.5 w-3.5' /> },
  ];
  if (isEditorPlus) {
    booksLinks.push({
      href: '/portal/reviews',
      label: 'Reviews',
      icon: <Star className='h-3.5 w-3.5' />,
    });
  }

  const contactsLinks: NavLink[] = [];
  if (isEditorPlus) {
    contactsLinks.push(
      {
        href: '/portal/applications',
        label: 'Applications',
        icon: <ClipboardList className='h-3.5 w-3.5' />,
      },
      {
        href: '/portal/contact',
        label: 'Contact',
        icon: <MessageSquare className='h-3.5 w-3.5' />,
      },
      {
        href: '/portal/secure-contact',
        label: 'Secure Contact',
        icon: <ShieldAlert className='h-3.5 w-3.5' />,
      },
      {
        href: '/portal/whistleblower',
        label: 'Whistleblower',
        icon: <ShieldAlert className='h-3.5 w-3.5' />,
      },
      {
        href: '/portal/subscribers',
        label: 'Subscribers',
        icon: <Users className='h-3.5 w-3.5' />,
      }
    );
  }

  const sections: NavSection[] = [
    {
      id: 'news',
      label: 'News',
      icon: <Newspaper className='h-3.5 w-3.5' />,
      links: newsLinks,
    },
    {
      id: 'books',
      label: 'Books',
      icon: <BookOpen className='h-3.5 w-3.5' />,
      links: booksLinks,
    },
  ];

  if (isEditorPlus) {
    sections.push({
      id: 'contacts',
      label: 'Contacts',
      icon: <Mail className='h-3.5 w-3.5' />,
      links: contactsLinks,
    });
  }

  sections.push({
    id: 'profile',
    label: 'Profile',
    icon: <User className='h-3.5 w-3.5' />,
    links: [
      {
        href: '/portal/profile',
        label: 'My Profile',
        icon: <UserCircle className='h-3.5 w-3.5' />,
      },
    ],
  });

  return sections;
}
