import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair, PublicKey} from '@solana/web3.js'
import {VotingPlayground} from '../target/types/voting_playground'
import { startAnchor } from 'solana-bankrun'
import { BankrunProvider } from 'anchor-bankrun'

const voting_playground_ID = new PublicKey("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ")

describe('voting_playground', () => {
  let context;
  let provider;
  let VotingProgram: Program<VotingPlayground>;
  const candidateName1 = "test-candidate-1";
  const candidateName2 = "test-candidate-2";
  let pollAddress: PublicKey;
  let candidateAddress1: PublicKey;
  let candidateAddress2: PublicKey;

  beforeAll(async () => {
    context = await startAnchor("", [{name: "voting_playground", programId: voting_playground_ID}], []);
    provider = new BankrunProvider(context);

    VotingProgram = anchor.workspace.VotingPlayground as Program<VotingPlayground>;

    // Step 1: Initialize Poll
    [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      voting_playground_ID
    );
    await VotingProgram.methods.initializePoll(
      new anchor.BN(1),
      "test-poll",
      new anchor.BN(0),
      new anchor.BN(1859508293)
    ).rpc();

    // Step 2: Initialize Candidate
    [candidateAddress1] = PublicKey.findProgramAddressSync(
      [Buffer.from("candidate"), Buffer.from(candidateName1), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      voting_playground_ID
    );
    [candidateAddress2] = PublicKey.findProgramAddressSync(
      [Buffer.from("candidate"), Buffer.from(candidateName2), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      voting_playground_ID
    );
    await VotingProgram.methods.initializeCandidate(candidateName1, new anchor.BN(1)).rpc();
    await VotingProgram.methods.initializeCandidate(candidateName2, new anchor.BN(1)).rpc();
  });

  it('initializePoll - should initialize poll with correct values', async () => {
    const poll = await VotingProgram.account.poll.fetch(pollAddress);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("test-poll");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });

  it('initializeCandidate - should initialize candidate with correct values', async () => {
    const candidate1 = await VotingProgram.account.candidate.fetch(candidateAddress1);

    expect(candidate1.candidateName).toEqual(candidateName1);
    expect(candidate1.candidateVotes.toNumber()).toEqual(0);

    const candidate2 = await VotingProgram.account.candidate.fetch(candidateAddress2);

    expect(candidate2.candidateName).toEqual(candidateName2);
    expect(candidate2.candidateVotes.toNumber()).toEqual(0);
  });

  it('vote - should cast a vote and update candidate votes count', async () => {
    // Call vote
    await VotingProgram.methods.vote(candidateName1, new anchor.BN(1)).rpc();

    // Fetch the updated candidate account
    const updatedCandidateAccount = await VotingProgram.account.candidate.fetch(candidateAddress1);
    console.log(updatedCandidateAccount);

    // Assertions
    expect(updatedCandidateAccount.candidateVotes.toNumber()).toEqual(1);
  });
});

