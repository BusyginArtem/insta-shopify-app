// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css';

// Style Imports
import '@/app/globals.css';

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css';
import Link from 'next/link';

export const metadata = {
  title: 'Insta Shop App Dev',
  description: 'Insta Shop App Dev - is the application for Instagram users.',
  other: {
    'shopify-api-key': process.env.NEXT_PUBLIC_SHOPIFY_API_KEY
  }
};

const RootLayout = ({ children }) => {
  // Vars
  const direction = 'ltr';

  return (
    <html id='__next' lang='en' dir={direction}>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src='https://cdn.shopify.com/shopifycloud/app-bridge.js' />
      </head>

      <body className='flex flex-col flex-auto is-full min-bs-full'>
        <ui-nav-menu>
          <Link href='/' rel='home' />
          <Link href='/about'>About</Link>
          <Link href='/home'>Home</Link>
          <Link href='/login'>Login</Link>
        </ui-nav-menu>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
