import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { PrintData } from '@/lib/escpos';

interface Props {
  data: PrintData;
  onClose: () => void;
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildReceiptHtml(invoice: PrintData['invoice']): string {
  function fmt(n: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }

  function fmtDate(iso: string): string {
    const d = new Date(iso);
    return (
      d.toLocaleDateString('en-PH', { month: 'short', day: '2-digit', year: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true })
    );
  }

  const itemsHtml = invoice.items
    .map(
      (item) => `
    <div>
      <div style="display:flex;justify-content:space-between">
        <span>${esc(item.product_name)}</span>
        <span>${fmt(item.subtotal)}</span>
      </div>
      ${
        item.quantity > 1
          ? `<div style="font-size:10px;padding-left:4px">x${item.quantity} @ ${fmt(item.product_price)}</div>`
          : ''
      }
    </div>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt ${esc(invoice.invoice_number)}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    body {
      width: 80mm;
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
    }
    .no-print, nav, sidebar, button, header, footer {
      display: none !important;
    }
    .receipt-container {
      width: 100%;
      padding: 5px;
      box-sizing: border-box;
      page-break-inside: avoid;
    }
    .c { text-align: center; }
    .b { font-weight: bold; }
    .l { font-size: 16px; }
    .s { border-top: 1px dashed #000; margin: 5px 0; }
    .r { display: flex; justify-content: space-between; }
    .pb { page-break-after: always; }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="c l b">SOULSIPS LOUNGE</div>
    <div class="c" style="font-size:10px;margin-bottom:5px">An elevated social lounge</div>
    <div class="s"></div>
    <div class="r"><span>${esc(invoice.invoice_number)}</span><span>${fmtDate(invoice.created_at)}</span></div>
    <div>Staff: ${esc(invoice.staff_name)}</div>
    ${invoice.room_name ? `<div>Room: ${esc(invoice.room_name)}${invoice.guest_count != null ? ` (${invoice.guest_count} pax)` : ''}</div>` : ''}
    <div class="s"></div>
    ${itemsHtml}
    <div class="s"></div>
    <div class="r b" style="font-size:14px"><span>TOTAL</span><span>${fmt(invoice.total)}</span></div>
    ${invoice.payment_method ? `<div>Payment: ${invoice.payment_method.toUpperCase()}</div>` : ''}
    ${invoice.amount_tendered !== null ? `<div class="r"><span>Cash</span><span>${fmt(invoice.amount_tendered)}</span></div>` : ''}
    ${invoice.change !== null ? `<div class="r"><span>Change</span><span>${fmt(invoice.change)}</span></div>` : ''}
    <div class="s"></div>
    <div class="c">THIS IS NOT AN OFFICIAL RECEIPT</div>
    <div class="s"></div>
    <div class="c b">Thank you!</div>
    <div class="c">Visit again :)</div>
    <div class="pb"></div>
  </div>
  <script>
    var RECEIPT_PRINTED = false;
    var RECEIPT_CLOSED = false;

    function doPrint() {
      if (RECEIPT_PRINTED) return;
      RECEIPT_PRINTED = true;
      window.print();
    }

    function cleanup() {
      if (RECEIPT_CLOSED) return;
      RECEIPT_CLOSED = true;
      try { window.close(); } catch(e) {}
    }

    window.onload = function() {
      setTimeout(doPrint, 200);
    };

    window.addEventListener('afterprint', cleanup);
    window.addEventListener('beforeunload', cleanup);
    setTimeout(cleanup, 10000);
  <\/script>
</body>
</html>`;
}

export default function ReceiptPrint({ data, onClose }: Props) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    const close = onCloseRef.current;
    const invoice = dataRef.current.invoice;

    let printWin: Window | null = null;

    try {
      printWin = window.open('', '_blank');
    } catch {
      // popup blocked
    }

    if (!printWin) {
      const timer = setTimeout(() => {
        window.print();
      }, 300);

      const fallback = setTimeout(close, 15000);

      return () => {
        clearTimeout(timer);
        clearTimeout(fallback);
      };
    }

    printWin.document.write(buildReceiptHtml(invoice));
    printWin.document.close();
    printWin.focus();

    const checkClosed = setInterval(() => {
      if (printWin.closed) {
        clearInterval(checkClosed);
        close();
      }
    }, 500);

    const fallback = setTimeout(() => {
      clearInterval(checkClosed);
      if (printWin && !printWin.closed) {
        try { printWin.close(); } catch { /* ignore */ }
      }
      close();
    }, 30000);

    return () => {
      clearInterval(checkClosed);
      clearTimeout(fallback);
    };
  }, []);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
      }}
    >
      <div
        style={{
          background: '#1c1917',
          color: '#a8a29e',
          padding: '24px 32px',
          borderRadius: 16,
          textAlign: 'center',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 14,
        }}
      >
        <strong
          style={{
            color: '#fbbf24',
            display: 'block',
            marginBottom: 8,
            fontSize: 16,
          }}
        >
          Printing Receipt...
        </strong>
        The print dialog should appear. Select your printer and click Print.
      </div>
    </div>,
    document.body,
  );
}
