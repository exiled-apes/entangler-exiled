import React from 'react';
// import { styled } from '@mui/system';

import { Settings } from './Settings';

// const MyComponent = styled('div')({
//   color: 'darkslategray',
//   backgroundColor: 'aliceblue',
//   padding: 8,
//   borderRadius: 4,
// });

export default function Header() {
  return (
    <div>
      <h1 style={{ color: 'white' }}>Exiled Entangler</h1>

      <Settings narrow={true} />
    </div>
  );
}
