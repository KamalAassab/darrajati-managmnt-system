import { UserCog } from 'lucide-react';

export default function UsersPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-8 text-center">
            <div className="w-24 h-24 bg-[#ea6819]/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <UserCog className="w-12 h-12 text-[#ea6819]" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-4">
                User Management
            </h1>
            <p className="text-white/50 text-lg max-w-md">
                Admin user management and role controls are under construction.
                <span className="block mt-2 text-[#ea6819]">Coming Soon!</span>
            </p>
        </div>
    );
}
