export type PageType =
  | 'home'
  | 'about'
  | 'skills'
  | 'projects'
  | 'blog'
  | 'contact'
  | 'checkout'
  | 'experience'
  | 'pricing';

export function getPageType(pathname: string): PageType {
  const normalizedPath = pathname.replace(/\/$/, '');

  switch (normalizedPath) {
    case '/':
      return 'home';
    case '/about':
      return 'about';
    case '/skills':
      return 'skills';
    case '/projects':
      return 'projects';
    case '/blog':
      return 'blog';
    case '/contact':
    case '/contacts':
      return 'contact';
    case '/pricing':
      return 'pricing';
    case '/experience':
      return 'experience';
    case '/checkout':
      return 'checkout';
    default:
      if (normalizedPath.startsWith('/testing-dashboard')) {
        return 'projects';
      }
      if (normalizedPath.startsWith('/dashboard')) {
        return 'experience';
      }
      if (normalizedPath.startsWith('/auth')) {
        return 'contact';
      }
      return 'home';
  }
}
