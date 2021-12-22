import React, { useMemo } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { styled } from '@mui/system';

import Header from './components/Header';
import { Swap } from './components/Swap';

const Root = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
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
        </BrowserRouter>
      </ThemeProvider>
    </Root>
  );
}
