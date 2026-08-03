const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `            {!currentUser ? (
              <div className="py-20 px-4 max-w-xl mx-auto text-center space-y-6 bg-white border border-slate-200 rounded-3xl shadow-sm my-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center shadow-xs">`;

const replacement = `            {!currentUser ? (
              <div className="py-20 px-4 max-w-xl mx-auto text-center space-y-6 bg-white border border-slate-200 rounded-3xl shadow-sm my-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center shadow-xs">`;

const fullReplacement = `            {!currentUser ? (
              <div className="py-20 px-4 max-w-xl mx-auto text-center space-y-6 bg-white border border-slate-200 rounded-3xl shadow-sm my-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">Resident Customer Login Required</h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Please log in or register to browse society shops, explore daily essentials, and place orders inside Manokamna Apartments.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-all"
                  >
                    Customer Login
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-xs transition-all"
                  >
                    Register Customer
                  </button>
                </div>
              </div>
            ) : currentUser.isBanned ? (
              <div className="py-20 px-4 max-w-xl mx-auto text-center space-y-6 bg-white border border-slate-200 rounded-3xl shadow-sm my-8">
                <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-rose-600">Account Banned</h2>
                  <p className="text-sm font-bold text-slate-700">You have been banned from our society marketplace.</p>
                  <p className="text-xs text-slate-500 font-medium">
                    You are unable to place orders or browse stores. Please contact the society admin for more information.
                  </p>
                </div>
              </div>
            ) : !selectedStore ? (`;

const targetBlock = `            {!currentUser ? (
              <div className="py-20 px-4 max-w-xl mx-auto text-center space-y-6 bg-white border border-slate-200 rounded-3xl shadow-sm my-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">Resident Customer Login Required</h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Please log in or register to browse society shops, explore daily essentials, and place orders inside Manokamna Apartments.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-all"
                  >
                    Customer Login
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-xs transition-all"
                  >
                    Register Customer
                  </button>
                </div>
              </div>
            ) : !selectedStore ? (`;

if (code.includes(targetBlock)) {
  code = code.replace(targetBlock, fullReplacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log('App patched');
} else {
  console.log('Target not found in App.tsx');
}
