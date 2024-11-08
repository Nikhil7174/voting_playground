'use client'

import {getVotingPlaygroundProgram, getVotingPlaygroundProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useVotingPlaygroundProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getVotingPlaygroundProgramId(cluster.network as Cluster), [cluster])
  const program = getVotingPlaygroundProgram(provider)

  const accounts = useQuery({
    queryKey: ['voting_playground', 'all', { cluster }],
    queryFn: () => program.account.voting_playground.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['voting_playground', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ voting_playground: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useVotingPlaygroundProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useVotingPlaygroundProgram()

  const accountQuery = useQuery({
    queryKey: ['voting_playground', 'fetch', { cluster, account }],
    queryFn: () => program.account.voting_playground.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['voting_playground', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ voting_playground: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['voting_playground', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ voting_playground: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['voting_playground', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ voting_playground: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['voting_playground', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ voting_playground: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
