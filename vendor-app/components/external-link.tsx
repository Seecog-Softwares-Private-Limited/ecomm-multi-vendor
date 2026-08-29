import { Link } from 'expo-router';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: NonNullable<ComponentProps<typeof Link>['href']>;
};

/**
 * In-app link only. Do not open Safari / Chrome Custom Tabs (App Store Guideline 4).
 * Native http(s) destinations stay inside the app navigator / WebView shell.
 */
export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target={Platform.OS === 'web' ? '_self' : undefined}
      {...rest}
      href={href}
    />
  );
}
