import React, { useCallback, useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@project-serum/anchor';
import { Button, CircularProgress } from '@mui/material';
import { useConnection } from '@oyster/common';
import {
  SystemProgram,
  Transaction,
  PublicKey,
  sendAndConfirmTransaction,
  Keypair,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

export default function DonateButton({ children, amount, to }) {
  const [loading, setLoading] = useState(false);
  const [, setTransactionSig] = useState('');

  const connection = useConnection();
  const wallet = useWallet();
  console.log(wallet);
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

  const handleClick = useCallback(async () => {
    if (!anchorWallet) return;
    try {
      setTransactionSig('');
      const from = Keypair.generate();
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: new PublicKey(to),
          lamports: LAMPORTS_PER_SOL * amount,
        }),
      );

      // Sign transaction, broadcast, and confirm
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from],
      );
      console.log(signature);
      // const updatedBalance = await refreshBalance(network, account);
    } catch (error) {
      console.log(error);
    }
  }, [amount, anchorWallet, connection, to]);

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? <CircularProgress /> : children}
    </Button>
  );
}
