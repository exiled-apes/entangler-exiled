import React from 'react';

import { styled } from '@mui/system';
import Button from '@mui/material/Button';
import TwitterIcon from '@mui/icons-material/Twitter';
import ChatIcon from '@mui/icons-material/Chat';

import { Settings } from './Settings';
import imageLogo from '../images/exiled-logo.png';

const HeaderRoot = styled('div')({
  padding: 8,
  borderRadius: 4,
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const SocialLinks = styled('div')({});

const Logo = styled('img')({
  width: 100,
  height: 100,
});

const LogoContainer = styled('div')({
  flex: '1 1 auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export default function Header() {
  return (
    <HeaderRoot>
      <SocialLinks>
        <Button
          href="https://discord.gg/exiledapes"
          target="_blank"
          rel="noreferrer"
        >
          <ChatIcon />
        </Button>
        <Button
          href="https://twitter.com/exiledapes"
          target="_blank"
          rel="noreferrer"
        >
          <TwitterIcon />
        </Button>
      </SocialLinks>

      <LogoContainer>
        <Logo src={imageLogo} />
      </LogoContainer>

      <div>
        <Button style={{ visibility: 'hidden' }} disabled></Button>
        <Settings narrow={true} />
      </div>
    </HeaderRoot>
  );
}
