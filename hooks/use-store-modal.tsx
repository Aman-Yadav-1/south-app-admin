import { create } from "zustand";

interface useStoreModalProps{
    isOpen: boolean,
    onOpen: () => void;
    onClosed: () => void;
}

export const useStoreModal = create<useStoreModalProps>((set)=>({
    isOpen : false,
    onOpen : () => set({isOpen: true}),
    onClosed: () => set({isOpen: false})
}))