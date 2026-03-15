/**
 * Generates and downloads a styled HTML invoice as a printable PDF
 * using a hidden iframe + window.print()
 */
export function downloadInvoice({ invoiceId, date, description, amount, status, patientName, paymentId, items = [] }) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Invoice ${invoiceId}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #0F4C81; }
  .brand { display: flex; flex-direction: column; gap: 4px; }
  .brand-name { font-size: 22px; font-weight: 900; color: #0F4C81; }
  .brand-sub { font-size: 11px; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 28px; font-weight: 900; color: #0F4C81; letter-spacing: 2px; }
  .invoice-meta p { font-size: 12px; color: #64748b; margin-top: 4px; }
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 6px;
    background: ${status === 'Paid' ? '#dcfce7' : status === 'Partial' ? '#dbeafe' : '#ffedd5'};
    color: ${status === 'Paid' ? '#15803d' : status === 'Partial' ? '#1d4ed8' : '#c2410c'}; }
  .section { margin-top: 28px; }
  .section-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .info-box { background: #f8fafc; border-radius: 8px; padding: 14px; }
  .info-box label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
  .info-box p { font-size: 13px; font-weight: 600; margin-top: 3px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  thead tr { background: #0F4C81; color: white; }
  thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  tbody tr { border-bottom: 1px solid #e2e8f0; }
  tbody tr:last-child { border-bottom: none; }
  tbody td { padding: 12px 14px; font-size: 13px; }
  .amount-col { text-align: right; font-weight: 700; }
  .totals { margin-top: 16px; display: flex; justify-content: flex-end; }
  .totals-box { width: 260px; }
  .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
  .totals-row.total { font-weight: 900; font-size: 15px; color: #0F4C81; border-bottom: none; padding-top: 10px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
  .footer p { font-size: 11px; color: #94a3b8; }
  .paid-stamp { border: 3px solid #16a34a; color: #16a34a; font-size: 22px; font-weight: 900; padding: 6px 18px; border-radius: 6px; transform: rotate(-15deg); letter-spacing: 3px; opacity: 0.7; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div class="brand">
    <div class="brand-name">Deepthi Hospitals</div>
    <div class="brand-sub">Compassionate Care · Advanced Medicine</div>
    <div style="font-size:11px;color:#64748b;margin-top:6px;">123 Health Avenue, Hyderabad — 500001<br/>Tel: 1-800-DEEPTHI · billing@deepthihospitals.com</div>
  </div>
  <div class="invoice-meta">
    <h2>INVOICE</h2>
    <p>${invoiceId}</p>
    <p>Date: ${date}</p>
    <span class="status-badge">${status}</span>
  </div>
</div>

<div class="section">
  <div class="info-grid">
    <div class="info-box">
      <label>Billed To</label>
      <p>${patientName || 'Patient'}</p>
    </div>
    <div class="info-box">
      ${paymentId ? `<label>Payment Reference</label><p>${paymentId}</p>` : `<label>Payment Status</label><p>${status}</p>`}
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Invoice Items</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Description</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${items.length > 0
        ? items.map((item, i) => `<tr><td>${i + 1}</td><td>${item.name || item.description || description}</td><td class="amount-col">₹${Number(item.amount || item.price || 0).toLocaleString('en-IN')}</td></tr>`).join('')
        : `<tr><td>1</td><td>${description}</td><td class="amount-col">₹${Number(amount).toLocaleString('en-IN')}</td></tr>`
      }
    </tbody>
  </table>
  <div class="totals">
    <div class="totals-box">
      <div class="totals-row"><span>Subtotal</span><span>₹${Number(amount).toLocaleString('en-IN')}</span></div>
      <div class="totals-row"><span>Tax (0%)</span><span>₹0</span></div>
      <div class="totals-row total"><span>Total</span><span>₹${Number(amount).toLocaleString('en-IN')}</span></div>
    </div>
  </div>
</div>

<div class="footer">
  <div>
    <p>Thank you for choosing Deepthi Hospitals.</p>
    <p style="margin-top:4px;">For queries: billing@deepthihospitals.com</p>
  </div>
  ${status === 'Paid' ? '<div class="paid-stamp">PAID</div>' : ''}
</div>
</body>
</html>`

  const iframe = document.createElement('iframe')

  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:800px;height:1000px;'
  document.body.appendChild(iframe)
  iframe.contentDocument.open()
  iframe.contentDocument.write(html)
  iframe.contentDocument.close()
  setTimeout(() => {
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
    setTimeout(() => document.body.removeChild(iframe), 1000)
  }, 300)
}

// Alias for backwards compatibility and tests
export const generateInvoice = downloadInvoice
