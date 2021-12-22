import React, { useMemo } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

import { Swap } from './components/Swap';

export default function App() {
  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: 'dark',
        primary: {
          main: '#ff8b0d',
        },
      },
    });
  }, []);

  return (
    <div>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <CssBaseline />
          <Box
            maxWidth="800px"
            width="calc(100% - 60px)"
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <Box height="40px" />
            <Switch>
              <Route path="/" component={Swap} />
            </Switch>
            <Box height="80px" />
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}
