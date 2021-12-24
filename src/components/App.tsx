import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { styled } from "@mui/system";

import "antd/dist/antd.css";
import "@fontsource/open-sans";
import "@fontsource/roboto";
import "@fontsource/sora";

import { WalletProvider } from "../contexts/WalletContext";
import { ConnectionProvider } from "../contexts/ConnectionContext";
import Footer from "./Footer";
import Header from "./Header";
import { Swap } from "./Swap";

const Root = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
});

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ff8b0d",
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

export default function App() {
  return (
    <React.StrictMode>
      <ConnectionProvider>
        <WalletProvider>
          <Root>
            <ThemeProvider theme={theme}>
              <BrowserRouter>
                <CssBaseline />
                <Header />
                <Routes>
                  <Route path="/" element={<Swap />} />
                </Routes>
                <Footer />
              </BrowserRouter>
            </ThemeProvider>
          </Root>
        </WalletProvider>
      </ConnectionProvider>
    </React.StrictMode>
  );
}
