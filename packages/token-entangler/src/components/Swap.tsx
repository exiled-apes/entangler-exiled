/* eslint-disable no-unused-vars */
import { useConnection } from '../contexts';
import { useWallet } from '@solana/wallet-adapter-react';
import React, { useMemo, useEffect, useCallback, useState } from 'react';
import * as anchor from '@project-serum/anchor';
import {
  loadTokenEntanglementProgram,
  swapEntanglement,
} from '../utils/entangler';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useWalletNfts } from '@nfteyez/sol-rayz-react';
import Header from './Header';
import mintList from '../utils/mint-list.json';

// 5ijPCm1s8epSAxceSP3DRotJCe4yWirS98UGDTopr8oa
const DAPE_TOKEN_ACCOUNT = 'oiyfj8dZ6x1Ts8ddD3SPvJN7VPvwayRUAY2dVsfBs3o';

// const mapA2B = mintList.reduce((map, addresses) => {
//   map[addresses[0]] = addresses[1];
//   return map;
// }, {});

// const mapB2A = mintList.reduce((map, addresses) => {
//   map[addresses[1]] = addresses[0];
//   return map;
// }, {});

export const Swap = () => {
  const connection = useConnection();
  const wallet = useWallet();
  const [entangledPair, setEntangledPair] = React.useState('');

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const loadProgram = useCallback(async () => {
    if (!anchorWallet) return;
    const anchorProgram = await loadTokenEntanglementProgram(
      anchorWallet,
      connection,
    );
    console.log(anchorProgram);
  }, [anchorWallet]);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  useEffect(() => {
    connection
      .getTokenAccountBalance(new PublicKey(DAPE_TOKEN_ACCOUNT))
      .then(res => {
        console.log('DAPE TOKEN RESPONSE', res);
      })
      .catch(err => {
        console.log('DAPE TOKEN ERROR', err);
      });
  }, []);

  const handleSubmit = async ({ mintA, mintB, entangledPair }) => {
    if (!anchorWallet) return;
    console.log(mintA, mintB);

    const txnResult = await swapEntanglement(
      anchorWallet,
      connection,
      mintA,
      mintB,
      entangledPair,
    );
    setEntangledPair(txnResult.epkey);
  };

  //, isLoading, error
  const { nfts } = useWalletNfts({
    publicAddress: wallet?.publicKey,
    connection,
  });

  const exiledApes = useMemo(
    () => (nfts || []).filter(nft => mintList.flat().includes(nft.mint)),
    [nfts],
  );

  const [imageMap, setImageMap] = useState({});

  const fetchImages = useCallback(async () => {
    if (exiledApes?.length) {
      const nextImages = {};
      for (const ape of exiledApes) {
        const response = await fetch(ape.data.uri);
        const data = await response.json();
        nextImages[ape.mint] = data.image;
      }
      setImageMap(state => ({ ...state, ...nextImages }));
    }
  }, [exiledApes]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    console.log('exiledApes', exiledApes);
    console.log('entangledPair', entangledPair);
  }, [exiledApes, entangledPair]);

  return (
    <React.Fragment>
      <Header />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gridGap: 10,
          padding: 20,
        }}
      >
        {exiledApes.map(ape => (
          <div
            key={ape.mint}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gridGap: 10,
            }}
          >
            <img src={imageMap[ape.mint]} alt="ape" width="150" />
            <Button
              variant="contained"
              onClick={async () => {
                const pair = mintList.find(addresses =>
                  addresses.includes(ape.mint),
                );
                if (!pair) return;
                const [mintA, mintB] = pair;
                // const [mintB, mintA] = pair;
                await handleSubmit({ mintA, mintB, entangledPair: '' });
              }}
              endIcon={<SendIcon />}
            >
              Swap
            </Button>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
};
