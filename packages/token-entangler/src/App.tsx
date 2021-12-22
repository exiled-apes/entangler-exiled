import React, { useMemo } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Link } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { styled } from '@mui/system';

import Header from './components/Header';
import { Swap } from './components/Swap';
// import DonateButton from './components/DonateButton';

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
});

const Footer = styled('div')({
  width: '100%',
  padding: 15,
  background: '#2a2a2a',
  borderTop: '2px solid #333333',
  marginTop: 40,
  textAlign: 'center',
  display: 'fleX',
  justifyContent: 'center',
  alignItems: 'center',
});

const About = styled('p')({
  color: '#aaaaaa',
  maxWidth: 550,
  textAlign: 'center',
});

export default function App() {
  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: '#ff8b0d',
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: `
            body {
              background: linear-gradient(162deg, rgba(51,51,51,1) 19%, rgba(14,14,14,1) 97%);
            }
          `,
        },
      },
    });
  }, []);

  return (
    <Root>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <CssBaseline />
          <Header />
          <Switch>
            <Route path="/" component={Swap} />
          </Switch>
          <Footer>
            <About>
              Art powered by{' '}
              <Link href="https://twitter.com/Mircathor">Mircathor</Link>:
              <br />
              <code>EFS5TGLDKCLBi7qsNTQJ5Gb5qQo426eByEXjYwkwLGYW</code>
              {/* <DonateButton
                amount={0.01}
                to="EFS5TGLDKCLBi7qsNTQJ5Gb5qQo426eByEXjYwkwLGYW"
              >
                Donate 0.5 SOL
              </DonateButton> */}
            </About>
          </Footer>
        </BrowserRouter>
      </ThemeProvider>
    </Root>
  );
}
