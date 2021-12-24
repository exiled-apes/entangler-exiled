import React from "react";
import { Link } from "@mui/material";
import { styled } from "@mui/system";

const FooterRoot = styled("div")({
  width: "100%",
  padding: 15,
  background: "#2a2a2a",
  borderTop: "2px solid #333333",
  marginTop: 40,
  textAlign: "center",
  display: "fleX",
  justifyContent: "center",
  alignItems: "center",
});

const About = styled("p")({
  color: "#aaaaaa",
  maxWidth: 550,
  textAlign: "center",
});

export default function Footer() {
  return (
    <FooterRoot>
      <About>
        Art powered by{" "}
        <Link href="https://twitter.com/Mircathor">Mircathor</Link>, Donate:
        <br />
        <code>EFS5TGLDKCLBi7qsNTQJ5Gb5qQo426eByEXjYwkwLGYW</code>
      </About>
    </FooterRoot>
  );
}
