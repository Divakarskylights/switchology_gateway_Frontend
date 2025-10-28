import { create } from 'zustand';

const useSideBarState = create((set) => ({
    drawerOpen:false,
    setDrawerOpen:(newVal)=>set({drawerOpen:newVal})  
}))
export default useSideBarState;