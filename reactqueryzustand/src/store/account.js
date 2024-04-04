import { create } from 'zustand'
import log from '../lib/log'

const useAccountStore = create(
  log((set) => ({
    mid: null,
    nickname: "",
    setAccount: ({ mid, nickname }) => set({ mid, nickname }),
  }))
)

export default useAccountStore