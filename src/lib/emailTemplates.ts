import { Order } from '../types';

export function generateStoreOwnerOrderHtml(order: Order): string {
  const itemsListHtml = Array.isArray(order.items)
    ? order.items
        .map(
          (item) =>
            `<tr>
              <td style="padding: 10px 8px; border-bottom: 1px solid #edf2f7; font-weight: 600; color: #1e293b;">${item.productName || (item as any).name || 'Product'}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #edf2f7; text-align: center; font-weight: 700; color: #0f172a;">${item.quantity}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #edf2f7; text-align: right; color: #475569;">₹${item.price}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: 700; color: #059669;">₹${item.price * item.quantity}</td>
            </tr>`
        )
        .join('')
    : '';

  return `
    <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #059669; padding: 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">🚨 New Society Order Placed!</h1>
        <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">Order #${order.id} for ${order.storeName}</p>
      </div>
      
      <div style="padding: 24px;">
        <p style="margin-top: 0; font-size: 14px;">Hello <strong>${order.storeName} Owner</strong>,</p>
        <p style="font-size: 14px;">A resident in Manokamna Apartments has placed a new order at your shop. Please accept or decline this order in your store portal.</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #059669; border-radius: 6px; padding: 14px; margin: 18px 0;">
          <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #047857;">Customer Details</h3>
          <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Customer Name:</strong> ${order.customerName}</p>
          <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Mobile:</strong> ${order.customerMobile}</p>
          <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Payment Mode:</strong> Cash / UPI on Doorstep Delivery</p>
        </div>

        <h3 style="font-size: 14px; color: #0f172a; margin-top: 20px; margin-bottom: 10px;">Ordered Items Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; color: #475569;">
              <th style="padding: 8px;">Item Name</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
          <tfoot>
            <tr style="font-weight: 800; font-size: 15px;">
              <td colspan="3" style="padding: 14px 8px 8px 8px; text-align: right; color: #0f172a;">Grand Total:</td>
              <td style="padding: 14px 8px 8px 8px; text-align: right; color: #059669;">₹${order.totalAmount}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; margin-top: 28px;">
          <a href="https://ais-dev-wuznhpqpfx4jbsxtydvwcl-385001701392.asia-east1.run.app" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;">Open Store Dashboard & Process Order</a>
        </div>
      </div>
      
      <div style="background-color: #f8fafc; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        Manokamna Apartments Society Marketplace • Automated Order Notification
      </div>
    </div>
  `;
}

export function generateCustomerReceiptHtml(order: Order): string {
  const itemsListHtml = Array.isArray(order.items)
    ? order.items
        .map(
          (item) =>
            `<tr>
              <td style="padding: 10px 8px; border-bottom: 1px solid #edf2f7; font-weight: 600; color: #1e293b;">${item.productName || (item as any).name || 'Product'}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #edf2f7; text-align: center; font-weight: 700; color: #0f172a;">${item.quantity}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #edf2f7; text-align: right; color: #475569;">₹${item.price}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: 700; color: #059669;">₹${item.price * item.quantity}</td>
            </tr>`
        )
        .join('')
    : '';

  return `
    <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #059669; padding: 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">✅ Order Receipt & Confirmation</h1>
        <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">Order #${order.id} from ${order.storeName}</p>
      </div>
      
      <div style="padding: 24px;">
        <p style="margin-top: 0; font-size: 14px;">Dear <strong>${order.customerName}</strong>,</p>
        <p style="font-size: 14px;">Thank you for your order! Your request has been sent to <strong>${order.storeName}</strong> inside Manokamna Apartments. Expected delivery is within 20 minutes.</p>
        
        <div style="background-color: #f0fdf4; border-left: 4px solid #059669; border-radius: 6px; padding: 14px; margin: 18px 0;">
          <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Order ID:</strong> #${order.id}</p>
          <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Shop:</strong> ${order.storeName}</p>
          <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Payment Method:</strong> Cash/UPI on Delivery</p>
        </div>

        <h3 style="font-size: 14px; color: #0f172a; margin-top: 20px; margin-bottom: 10px;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; color: #475569;">
              <th style="padding: 8px;">Item Name</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
          <tfoot>
            <tr style="font-weight: 800; font-size: 15px;">
              <td colspan="3" style="padding: 14px 8px 8px 8px; text-align: right; color: #0f172a;">Total Payable:</td>
              <td style="padding: 14px 8px 8px 8px; text-align: right; color: #059669;">₹${order.totalAmount}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; margin-top: 28px;">
          <a href="https://ais-dev-wuznhpqpfx4jbsxtydvwcl-385001701392.asia-east1.run.app" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;">Track Order Live Status</a>
        </div>
      </div>
      
      <div style="background-color: #f8fafc; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        Manokamna Apartments Society Marketplace • Verified Inside-Gate Delivery
      </div>
    </div>
  `;
}

export function generateCustomerStatusUpdateHtml(order: Order, status: string): string {
  const isDelivered = status.toLowerCase() === 'delivered';
  const itemsListHtml = Array.isArray(order.items)
    ? order.items
        .map(
          (item) =>
            `<tr>
              <td style="padding: 10px 8px; border-bottom: 1px solid #edf2f7; font-weight: 600; color: #1e293b;">${item.productName || (item as any).name || 'Product'}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #edf2f7; text-align: center; font-weight: 700; color: #0f172a;">${item.quantity}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #edf2f7; text-align: right; color: #475569;">₹${item.price}</td>
              <td style="padding: 10px 8px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: 700; color: #059669;">₹${item.price * item.quantity}</td>
            </tr>`
        )
        .join('')
    : '';

  if (isDelivered) {
    return `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #059669; padding: 22px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">🎉 Order Delivered Successfully!</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.95;">Order #${order.id} from ${order.storeName}</p>
        </div>
        
        <div style="padding: 24px;">
          <p style="margin-top: 0; font-size: 15px;">Dear <strong>${order.customerName}</strong>,</p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0 0 6px 0; font-size: 15px; color: #047857; font-weight: 700;">
              ❤️ Thank you for shopping with us at Manokamna Apartments Society Marketplace!
            </p>
            <p style="margin: 0; font-size: 14px; color: #166534;">
              We are delighted to confirm that your order <strong>#${order.id}</strong> from <strong>${order.storeName}</strong> has been successfully delivered to your doorstep.
            </p>
          </div>

          <div style="background-color: #f8fafc; border-left: 4px solid #059669; border-radius: 6px; padding: 14px; margin: 18px 0;">
            <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #047857;">Delivery Summary</h3>
            <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Order ID:</strong> #${order.id}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Store Name:</strong> ${order.storeName}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Payment Status:</strong> Paid (₹${order.totalAmount})</p>
            <p style="margin: 0; font-size: 14px;"><strong>Status:</strong> <span style="background-color: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 12px;">DELIVERED ✅</span></p>
          </div>

          <h3 style="font-size: 14px; color: #0f172a; margin-top: 20px; margin-bottom: 10px;">Delivered Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px;">
            <thead>
              <tr style="background-color: #f1f5f9; text-align: left; color: #475569;">
                <th style="padding: 8px;">Item Name</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
            </tbody>
            <tfoot>
              <tr style="font-weight: 800; font-size: 15px;">
                <td colspan="3" style="padding: 14px 8px 8px 8px; text-align: right; color: #0f172a;">Total Amount:</td>
                <td style="padding: 14px 8px 8px 8px; text-align: right; color: #059669;">₹${order.totalAmount}</td>
              </tr>
            </tfoot>
          </table>

          <div style="text-align: center; margin-top: 28px;">
            <a href="https://ais-dev-wuznhpqpfx4jbsxtydvwcl-385001701392.asia-east1.run.app" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;">Shop Again on Society Marketplace</a>
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
          Manokamna Apartments Society Marketplace • Thank You for Shopping Local!
        </div>
      </div>
    `;
  }

  const formattedStatus = status.replace('_', ' ').toUpperCase();
  return `
    <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #3b82f6; padding: 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 800;">🔔 Order Status Update</h1>
        <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">Order #${order.id} from ${order.storeName}</p>
      </div>
      
      <div style="padding: 24px;">
        <p style="margin-top: 0; font-size: 14px;">Dear <strong>${order.customerName}</strong>,</p>
        <p style="font-size: 14px;">Your order <strong>#${order.id}</strong> from <strong>${order.storeName}</strong> has been updated to:</p>
        
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; text-align: center; margin: 16px 0;">
          <span style="font-weight: 800; font-size: 16px; color: #1d4ed8; letter-spacing: 0.5px;">${formattedStatus}</span>
        </div>

        <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 6px; padding: 14px; margin: 18px 0;">
          <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Store:</strong> ${order.storeName}</p>
          <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        </div>

        <h3 style="font-size: 14px; color: #0f172a; margin-top: 20px; margin-bottom: 10px;">Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; color: #475569;">
              <th style="padding: 8px;">Item Name</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
          <tfoot>
            <tr style="font-weight: 800; font-size: 15px;">
              <td colspan="3" style="padding: 14px 8px 8px 8px; text-align: right; color: #0f172a;">Grand Total:</td>
              <td style="padding: 14px 8px 8px 8px; text-align: right; color: #2563eb;">₹${order.totalAmount}</td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align: center; margin-top: 28px;">
          <a href="https://ais-dev-wuznhpqpfx4jbsxtydvwcl-385001701392.asia-east1.run.app" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;">Track Order Status Live</a>
        </div>
      </div>
      
      <div style="background-color: #f8fafc; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        Manokamna Apartments Society Marketplace Notification
      </div>
    </div>
  `;
}
