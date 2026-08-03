const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminDashboard.tsx', 'utf8');

const target = `              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Detailed Store-Wise Analytics</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Separate analysis of every shop's activity and inventory levels</p>
              </div>
              <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <StoreIcon className="w-3.5 h-3.5 text-slate-600" />
                <span>{stores.length} Shops Total</span>
              </div>
            </div>

            {stores.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <StoreIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold">No registered stores yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {stores.map((s) => {
                  const storeOrdersList = orders.filter((o) => o.storeId === s.id);
                  const storeSuccessfulOrders = storeOrdersList.filter((o) => o.status !== 'rejected' && o.status !== 'cancelled');
                  const storeTotalSales = storeSuccessfulOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                  const storeProductsList = products.filter((p) => p.storeId === s.id);
                  const storePendingApprovalOrders = storeOrdersList.filter((o) => o.status === 'pending').length;

                  // Percentage of total platform sales
                  const shareOfSales = totalRevenue > 0 ? Math.round((storeTotalSales / totalRevenue) * 100) : 0;`;

const replacement = `              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Detailed Store-Wise Analytics</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Separate analysis of every shop's activity and inventory levels</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={analyticsTimeframe}
                  onChange={(e) => setAnalyticsTimeframe(e.target.value as any)}
                  className="bg-slate-100 border-none text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                >
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="lifetime">Lifetime</option>
                </select>
                <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <StoreIcon className="w-3.5 h-3.5 text-slate-600" />
                  <span>{stores.length} Shops Total</span>
                </div>
              </div>
            </div>

            {stores.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <StoreIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold">No registered stores yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {stores.map((s) => {
                  const allStoreOrdersList = orders.filter((o) => o.storeId === s.id);
                  const storeOrdersList = filterOrdersByTimeframe(allStoreOrdersList);
                  const storeSuccessfulOrders = storeOrdersList.filter((o) => o.status !== 'rejected' && o.status !== 'cancelled');
                  const storeTotalSales = storeSuccessfulOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                  const storeProductsList = products.filter((p) => p.storeId === s.id);
                  const storePendingApprovalOrders = storeOrdersList.filter((o) => o.status === 'pending').length;

                  // Percentage of total platform sales in this timeframe
                  const timeframeTotalRevenue = filterOrdersByTimeframe(successfulOrders).reduce((sum, o) => sum + o.totalAmount, 0);
                  const shareOfSales = timeframeTotalRevenue > 0 ? Math.round((storeTotalSales / timeframeTotalRevenue) * 100) : 0;`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/admin/AdminDashboard.tsx', code);
  console.log("Success");
} else {
  console.log("Target not found!");
}
