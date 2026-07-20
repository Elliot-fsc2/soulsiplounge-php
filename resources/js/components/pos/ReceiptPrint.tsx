import { useEffect, useRef, useState } from 'react';
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

function buildReceiptHtml(invoice: PrintData['invoice']): string {
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

  return `
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
    </div>`;
}

export default function ReceiptPrint({ data, onClose }: Props) {
  const [phase, setPhase] = useState<'idle' | 'printing' | 'done'>('idle');
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPhase('printing');

    const timer = setTimeout(() => {
      window.print();
    }, 300);

    const handleAfterPrint = () => {
      setPhase('done');
      setTimeout(onClose, 500);
    };

    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [onClose]);

  const invoice = data.invoice;
  const receiptContent = buildReceiptHtml(invoice);

  return createPortal(
    <>
      <style>{`
        @media print {
          body > *:not(.print-receipt-wrapper) {
            display: none !important;
          }
          .print-receipt-wrapper {
            display: block !important;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
          .print-receipt-wrapper {
            width: 80mm;
            margin: 0;
            padding: 0;
            background: #fff;
            color: #000;
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
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
        }
      `}</style>
      {phase === 'printing' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
          <div className="rounded-2xl bg-stone-900 px-8 py-6 text-center font-mono text-sm text-stone-400 shadow-2xl">
            <strong className="mb-2 block text-base text-amber-400">
              Printing Receipt...
            </strong>
            The print dialog should appear. Select your printer and click Print.
          </div>
        </div>
      )}
      <div
        ref={receiptRef}
        className="print-receipt-wrapper"
        style={{
          display: 'none',
        }}
        dangerouslySetInnerHTML={{ __html: receiptContent }}
      />
    </>,
    document.body,
  );
}
