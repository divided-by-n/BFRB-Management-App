import { create } from 'zustand';

const useStore = create((set) => ({
    alertDuration: '1', 
    setAlertDuration: (duration) => set({ alertDuration: duration }),
    
    user: null,
    setUser: (user) => set({ user }),

    privacySettings: { 
        shareActivityData: false, 
        allowNotifications: false 
    },
    setPrivacySettings: (settings) => set({ privacySettings: settings }),

    notificationsEnabled: false,
    setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
}));

export default useStore;
