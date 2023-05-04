import ReduxWrapper from '@/components/redux-wrapper/redux-wrapper.component'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return(
    <ReduxWrapper>
      <Component {...pageProps} />
    </ReduxWrapper>
  );
}
