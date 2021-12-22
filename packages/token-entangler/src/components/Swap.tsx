import { useConnection } from '../contexts';
import { useWallet } from '@solana/wallet-adapter-react';
import React, { useMemo, useEffect, useCallback, useState } from 'react';
import * as anchor from '@project-serum/anchor';
import CircularProgress from '@mui/material/CircularProgress';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@mui/material';
import { styled } from '@mui/system';
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz';
import { ensureAtaExists } from '../utils/ensureAtaExists';

import {
  loadTokenEntanglementProgram,
  swapEntanglement,
} from '../utils/entangler';
import { useWalletModal } from '../contexts';
import mintList from '../utils/mint-list.json';

const SwapRoot = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexDirection: 'column',
  flex: '1 1 auto',
});

const SwapBox = styled('div')({
  background: '#2a2a2a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gridGap: 10,
  padding: 50,
  border: '2px solid #333333',
  boxShadow: '0px 0px 50px rgba(0,0,0,0.5)',
  borderRadius: 10,
  marginTop: 40,
});

const SwapCard = styled('div')({
  background: '#2a2a2a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gridGap: 10,
});

const NftImage = styled('img')({
  width: 200,
  height: 200,
  background: '#000',
});

const Placeholder = styled('div')({
  width: 200,
  height: 200,
  background: '#000',
});

const Title = styled('h1')({
  color: '#ff8b0d',
  fontWeight: 'bold',
  fontSize: '3rem',
});

const Title2 = styled('h1')({
  color: '#ff8b0d',
  fontWeight: 'bold',
  fontSize: '2rem',
  display: 'block',
});

const About = styled('p')({
  color: '#aaaaaa',
  maxWidth: 550,
  textAlign: 'center',
});

const allMintAddresses = mintList.flat();

export function Swap() {
  const connection = useConnection();
  const wallet = useWallet();
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [matchingNfts, setMatchingNfts] = useState<any>([]);
  const [bustedTokenAddresses, setBustedTokenAddresses] = useState<any>([]);
  const { setVisible } = useWalletModal();

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
    await loadTokenEntanglementProgram(anchorWallet, connection);
  }, [anchorWallet, connection]);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  const updateNfts = useCallback(async () => {
    if (!wallet?.publicKey) return null;
    setLoading(true);
    const nfts = await getParsedNftAccountsByOwner({
      publicAddress: wallet?.publicKey,
      connection,
    });
    const nextMatchingNfts = (nfts || []).filter(nft =>
      allMintAddresses.includes(nft.mint),
    );
    const programId = new PublicKey(
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    );
    const allTokens = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(wallet?.publicKey),
      { programId },
    );
    const existingNftAddresses = nextMatchingNfts.map(x => x.mint);
    const allTokenAddresses = allTokens?.value
      ?.filter(
        value => value.account.data.parsed.info.tokenAmount.amount !== '0',
      )
      ?.map(value => value.account.data.parsed.info.mint);

    const nextBustedTokenAddresses = allTokenAddresses
      .filter(address => allMintAddresses.includes(address))
      .filter(address => !existingNftAddresses.includes(address))
      .map(address => ({ mint: address }));

    setMatchingNfts(nextMatchingNfts);
    setBustedTokenAddresses(nextBustedTokenAddresses);
    setLoading(false);
  }, [connection, wallet?.publicKey]);

  useEffect(() => {
    updateNfts();
  }, [updateNfts]);

  const handleSubmit = useCallback(
    async ({ mintA, mintB, entangledPair }) => {
      if (!anchorWallet) return;
      console.log({ mintA, mintB });
      setLoading(true);

      await ensureAtaExists(anchorWallet, connection, mintA);
      // await ensureAtaExists(anchorWallet, connection, mintB);

      const txnResult = await swapEntanglement(
        anchorWallet,
        connection,
        mintA,
        mintB,
        entangledPair,
      );
      updateNfts();
      console.log('entangledPair', txnResult.epkey);
    },
    [anchorWallet, connection, updateNfts],
  );

  const fetchImages = useCallback(async () => {
    if (matchingNfts?.length) {
      const nextImages = {};
      for (const nft of matchingNfts) {
        const response = await fetch(nft.data.uri);
        const data = await response.json();
        nextImages[nft.mint] = data.image;
      }
      setImageMap(state => ({ ...state, ...nextImages }));
    }
  }, [matchingNfts]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const noTokensFound = useMemo(() => {
    return !bustedTokenAddresses?.length && !matchingNfts?.length;
  }, [bustedTokenAddresses?.length, matchingNfts?.length]);

  const renderItem = useCallback(
    ape => {
      const pair = mintList.find(addresses => addresses.includes(ape.mint));
      const isOldToken = pair?.indexOf(ape.mint) === 1;
      return (
        <SwapCard key={ape.mint}>
          {imageMap[ape.mint] ? (
            <NftImage src={imageMap[ape.mint]} alt="ape" />
          ) : (
            <Placeholder />
          )}
          <Button
            variant="contained"
            onClick={async () => {
              if (!pair) return;
              const [mintA, mintB] = pair;
              await handleSubmit({ mintA, mintB, entangledPair: '' });
            }}
          >
            {isOldToken ? 'Swap for New Token' : 'Swap for Old Token'}
          </Button>
        </SwapCard>
      );
    },
    [handleSubmit, imageMap],
  );

  return (
    <SwapRoot>
      <Title>Ape Swap.</Title>
      {!loading && !!wallet?.connected && (
        <About>
          Initial swap is 1 SOL all swaps after that will be free. You can swap
          back and forth as many times as you'd like as long as you own the
          token.
        </About>
      )}
      <SwapBox>
        {loading && <CircularProgress />}
        {!loading && !wallet?.connected && (
          <Button variant="contained" onClick={() => setVisible(true)}>
            Connect Wallet
          </Button>
        )}
        {!loading && !!wallet?.connected && (
          <>
            {bustedTokenAddresses.map(renderItem)}
            {matchingNfts.map(renderItem)}
          </>
        )}
        {!loading && !!wallet?.connected && noTokensFound && (
          <div style={{ textAlign: 'center' }}>
            <Title2>NGMI</Title2>
            <Button
              variant="outlined"
              target="_blank"
              rel="noopener noreferrer"
              href="https://magiceden.io/marketplace/exiled_degen_ape_academy"
            >
              Redeem yourself
            </Button>
          </div>
        )}
      </SwapBox>
    </SwapRoot>
  );
}
