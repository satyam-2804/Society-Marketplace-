import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

export const GmailConnectButton: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { isGmailLinked, connectedGmail, connectGmail, disconnectGmailAccount } = useMarketplace();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleConnect = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await connectGmail();
      if (!res.success) {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  if (isGmailLinked) {
    return (
      <div className={`flex items-center justify-between gap-2 ${compact ? '' : 'bg-emerald-50 border border-emerald-200 p-3 rounded-xl'}`}>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Gmail Connected
          </p>
          {!compact && connectedGmail && (
            <p className="text-[10px] text-emerald-600 truncate">{connectedGmail}</p>
          )}
        </div>
        <button
          type="button"
          onClick={disconnectGmailAccount}
          className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1 bg-emerald-100 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <button
        type="button"
        onClick={handleConnect}
        disabled={isLoading}
        className={`flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 active:scale-95 text-white transition-all font-bold ${compact ? 'px-3 py-1.5 text-[11px] rounded-lg' : 'w-full py-2.5 text-xs rounded-xl shadow-sm'}`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Mail className="w-3.5 h-3.5" />
        )}
        <span>Connect Gmail</span>
      </button>
      {errorMsg && <p className="text-[10px] text-red-500 font-medium px-1">{errorMsg}</p>}
    </div>
  );
};
