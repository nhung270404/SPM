import { ProfileForm } from './profile-form';

export function AccountView() {
  return (
    <div className="flex flex-col h-[calc(100vh-48px)] w-full bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white overflow-hidden transition-colors duration-300">
      
      {/* VÙNG CUỘN NỘI DUNG */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth min-h-0 bg-transparent">
        <div className="max-w-5xl mx-auto pb-20 pt-2">
           <ProfileForm />
        </div>
      </div>
    </div>
  );
}