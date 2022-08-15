import '../styles/globals.css';
import type { AppProps } from 'next/app';

// eslint-disable-next-line arrow-body-style
const MyApp = ({ Component, pageProps }: AppProps) => {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Component {...pageProps} />;
};

export default MyApp;
