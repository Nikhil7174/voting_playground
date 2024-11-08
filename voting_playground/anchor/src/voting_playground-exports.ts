// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import VotingPlaygroundIDL from '../target/idl/voting_playground.json'
import type { VotingPlayground } from '../target/types/voting_playground'

// Re-export the generated IDL and type
export { VotingPlayground, VotingPlaygroundIDL }

// The programId is imported from the program IDL.
export const VOTING_PLAYGROUND_PROGRAM_ID = new PublicKey(VotingPlaygroundIDL.address)

// This is a helper function to get the VotingPlayground Anchor program.
export function getVotingPlaygroundProgram(provider: AnchorProvider) {
  return new Program(VotingPlaygroundIDL as VotingPlayground, provider)
}

// This is a helper function to get the program ID for the VotingPlayground program depending on the cluster.
export function getVotingPlaygroundProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the VotingPlayground program on devnet and testnet.
      return new PublicKey('CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg')
    case 'mainnet-beta':
    default:
      return VOTING_PLAYGROUND_PROGRAM_ID
  }
}
