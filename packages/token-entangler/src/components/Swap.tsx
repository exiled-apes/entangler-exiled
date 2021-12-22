import { useConnection } from '../contexts';
import { useWallet } from '@solana/wallet-adapter-react';
import React, { useMemo, useEffect, useCallback, useState } from 'react';
import * as anchor from '@project-serum/anchor';
import {
  loadTokenEntanglementProgram,
  swapEntanglement,
} from '../utils/entangler';
import CircularProgress from '@mui/material/CircularProgress';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@mui/material';
import { useWalletModal } from '../contexts';
import mintList from '../utils/mint-list.json';
import { styled } from '@mui/system';
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz';

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
  marginTop: 50,
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

const allMintAddresses = mintList.flat();

export function Swap() {
  const connection = useConnection();
  const wallet = useWallet();
  const [entangledPair, setEntangledPair] = useState('');
  const [nfts, setNfts] = useState<any>();
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(false);
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
    // console.log(anchorProgram);
  }, [anchorWallet, connection]);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  const matchingNfts = useMemo(
    () => (nfts || []).filter(nft => allMintAddresses.includes(nft.mint)),
    [nfts],
  );

  const updateNfts = useCallback(async () => {
    setLoading(true);
    const nextNfts = await getParsedNftAccountsByOwner({
      publicAddress: wallet?.publicKey,
      connection,
    });
    setNfts(nextNfts);
    setLoading(false);
  }, [connection, wallet?.publicKey]);

  useEffect(() => {
    updateNfts();
  }, [updateNfts]);

  const updateBustedTokens = useCallback(async () => {
    if (!wallet?.publicKey) return;
    const programId = new PublicKey(
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    );
    const allTokens = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(wallet?.publicKey),
      { programId },
    );
    const existingNftAddresses = matchingNfts.map(x => x.mint);
    const allTokenAddresses = allTokens?.value
      ?.filter(
        value => value.account.data.parsed.info.tokenAmount.amount !== '0',
      )
      ?.map(value => value.account.data.parsed.info.mint);

    const nextBustedTokenAddresses = allTokenAddresses
      .filter(address => allMintAddresses.includes(address))
      .filter(address => !existingNftAddresses.includes(address))
      .map(address => ({ mint: address }));
    console.log('nextBustedTokenAddresses', nextBustedTokenAddresses);

    setBustedTokenAddresses(nextBustedTokenAddresses);
  }, [connection, matchingNfts, wallet?.publicKey]);

  useEffect(() => {
    updateBustedTokens();
  }, [updateBustedTokens]);

  const updateAllTokens = useCallback(async () => {
    setLoading(true);
    await updateNfts();
    await updateBustedTokens();
    setLoading(false);
  }, [updateBustedTokens, updateNfts]);

  const handleSubmit = useCallback(
    async ({ mintA, mintB, entangledPair }) => {
      if (!anchorWallet) return;
      console.log({ mintA, mintB });
      setLoading(true);

      const txnResult = await swapEntanglement(
        anchorWallet,
        connection,
        mintA,
        mintB,
        entangledPair,
      );
      updateAllTokens();
      console.log('entangledPair', txnResult.epkey);
      setEntangledPair(txnResult.epkey);
    },
    [anchorWallet, connection, updateAllTokens],
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

  useEffect(() => {
    console.log('matchingNfts', matchingNfts);
    console.log('entangledPair', entangledPair);
  }, [matchingNfts, entangledPair]);

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
    <React.Fragment>
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
      </SwapBox>
    </React.Fragment>
  );
}
