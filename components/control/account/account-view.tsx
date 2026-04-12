import { ProfileForm } from './profile-form';

export function AccountView() {
  return (
    <div className="flex flex-col h-[calc(100vh-48px)] w-full bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-900 dark:text-white overflow-hidden transition-colors duration-300">
      
      {/* VÙNG CUỘN NỘI DUNG */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth min-h-0 bg-transparent">
        <div className="max-w-4xl mx-auto pb-20 pt-4">
           <ProfileForm />
        </div>
      </div>
    </div>
  );
}