import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PrintData } from '@/lib/escpos';

interface Props {
  data: PrintData;
  onClose: () => void;
}

const COLS = 48;

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

function padRight(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : str + ' '.repeat(len - str.length);
}

function center(str: string, len: number = COLS): string {
  const pad = Math.max(0, Math.floor((len - str.length) / 2));

  return ' '.repeat(pad) + str;
}

function separator(): string {
  return '-'.repeat(COLS);
}

function doubleSeparator(): string {
  return '='.repeat(COLS);
}

function buildReceiptLines(invoice: PrintData['invoice']): string[] {
  const lines: string[] = [];

  lines.push(doubleSeparator());
  lines.push(center('SOULSIPS LOUNGE'));
  lines.push(center('An elevated social lounge'));
  lines.push(doubleSeparator());
  lines.push('');

  lines.push(`${padRight('Invoice:', 12)}${invoice.invoice_number}`);
  lines.push(`${padRight('Date:', 12)}${fmtDate(invoice.created_at)}`);
  lines.push(`${padRight('Staff:', 12)}${invoice.staff_name}`);

  if (invoice.room_name) {
    const roomLabel = invoice.guest_count != null
      ? `${invoice.room_name} (${invoice.guest_count} pax)`
      : invoice.room_name;
    lines.push(`${padRight('Room:', 12)}${roomLabel}`);
  }

  lines.push(separator());
  lines.push('');

  for (const item of invoice.items) {
    const name = esc(item.product_name);
    const price = fmt(item.subtotal);

    if (item.quantity > 1) {
      lines.push(padRight(name, COLS - price.length) + price);
      lines.push(center(`x${item.quantity} @ ${fmt(item.product_price)}`, COLS));
    } else {
      lines.push(padRight(name, COLS - price.length) + price);
    }
  }

  lines.push('');
  lines.push(separator());
  lines.push('');

  const totalStr = fmt(invoice.total);
  lines.push(doubleSeparator());
  lines.push(padRight('TOTAL', COLS - totalStr.length) + totalStr);
  lines.push(doubleSeparator());

  lines.push('');

  if (invoice.payment_method) {
    lines.push(`${padRight('Payment:', 12)}${invoice.payment_method.toUpperCase()}`);
  }

  if (invoice.amount_tendered !== null) {
    const cashStr = fmt(invoice.amount_tendered);
    lines.push(padRight('Cash:', COLS - cashStr.length) + cashStr);
  }

  if (invoice.change !== null) {
    const changeStr = fmt(invoice.change);
    lines.push(padRight('Change:', COLS - changeStr.length) + changeStr);
  }

  lines.push('');
  lines.push(separator());
  lines.push(center('THIS IS NOT AN OFFICIAL RECEIPT'));
  lines.push(separator());
  lines.push('');
  lines.push(center('Thank you!'));
  lines.push(center('Visit again'));
  lines.push('');
  lines.push(doubleSeparator());

  return lines;
}

function buildReceiptHtml(invoice: PrintData['invoice']): string {
  const lines = buildReceiptLines(invoice);

  return lines.map((line) => `<div class="receipt-line">${line || '&nbsp;'}</div>`).join('');
}

export default function ReceiptPrint({ data, onClose }: Props) {
  const [showOverlay, setShowOverlay] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 300);

    const handleAfterPrint = () => {
      setShowOverlay(false);

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
            padding: 3mm 4mm;
            background: #fff;
            color: #000;
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            font-weight: 700;
            line-height: 1.6;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .receipt-container {
            width: 100%;
            padding: 0;
            box-sizing: border-box;
            page-break-inside: avoid;
          }
          .receipt-line {
            white-space: pre;
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            font-weight: 700;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            letter-spacing: 0.5px;
          }
        }
        @media screen {
          .print-receipt-wrapper {
            display: none;
          }
        }
      `}</style>
      {showOverlay && (
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
        dangerouslySetInnerHTML={{ __html: `<div class="receipt-container">${receiptContent}</div>` }}
      />
    </>,
    document.body,
  );
}
