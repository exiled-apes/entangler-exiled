import * as anchor from '@project-serum/anchor';
import { web3 } from '@project-serum/anchor';
import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { Token } from '@solana/spl-token';
import { getAtaForMint } from './entangler';
import { sendTransactionWithRetryWithKeypair } from './transactions';

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

export function createAssociatedTokenAccountInstruction(
  associatedTokenAddress: PublicKey,
  payer: PublicKey,
  walletAddress: PublicKey,
  splTokenMintAddress: PublicKey,
) {
  const keys = [
    {
      pubkey: payer,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: associatedTokenAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: walletAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: splTokenMintAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  return new TransactionInstruction({
    keys,
    programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    data: Buffer.from([]),
  });
}

function getTransferInstructions(
  source: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
) {
  return Token.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    source,
    destination,
    owner,
    [],
    1,
  );
}

export async function ensureAtaExists(
  anchorWallet: any, // AnchorWallet | undefined,
  connection: Connection,
  mint: string,
): Promise<any> {
  const mintKey = new web3.PublicKey(mint);
  const largestAccount = (await connection.getTokenLargestAccounts(mintKey))
    .value[0];
  const [tokenAccountKey] = await getAtaForMint(
    mintKey,
    anchorWallet.publicKey,
  );
  const instructions: any[] = [];
  if (largestAccount.address.toBase58() !== tokenAccountKey.toBase58()) {
    const accountInfo: any = await connection.getParsedAccountInfo(
      tokenAccountKey,
    );
    if (accountInfo.value === null) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          tokenAccountKey,
          anchorWallet.publicKey,
          anchorWallet.publicKey,
          mintKey,
        ),
      );
    }
    // @ts-ignore
    const needsTransfer =
      !accountInfo.value ||
      (accountInfo.value &&
        accountInfo.value.data?.parsed.info.tokenAmount.uiAmount === 0);

    if (needsTransfer) {
      instructions.push(
        getTransferInstructions(
          largestAccount.address,
          tokenAccountKey,
          anchorWallet.publicKey,
        ),
      );
    }
  }

  const signers: anchor.web3.Keypair[] = [];

  const txData = await sendTransactionWithRetryWithKeypair(
    connection,
    anchorWallet,
    instructions,
    signers,
    'max',
  );

  return txData;
}
