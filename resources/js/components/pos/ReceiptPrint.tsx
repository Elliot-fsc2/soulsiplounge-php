import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PrintData } from '@/lib/escpos';

interface Props {
  data: PrintData;
  onClose: () => void;
}

const COLS = 40;

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
    const name = item.product_name;
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

const CANVAS_WIDTH = 800;
const FONT_SIZE = 26;
const CHAR_HEIGHT = 38;
const PAD_X = 32;
const PAD_Y = 32;

function thresholdToBlack(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < 240 || data[i + 1] < 240 || data[i + 2] < 240) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function renderReceiptImage(lines: string[]): string {
  const height = PAD_Y * 2 + lines.length * CHAR_HEIGHT;

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_WIDTH, height);

  ctx.fillStyle = '#000000';
  ctx.font = `bold ${FONT_SIZE}px 'Courier New', Courier, monospace`;
  ctx.textBaseline = 'top';

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], PAD_X, PAD_Y + i * CHAR_HEIGHT);
  }

  thresholdToBlack(ctx, CANVAS_WIDTH, height);

  return canvas.toDataURL('image/png');
}

export default function ReceiptPrint({ data, onClose }: Props) {
  const [showOverlay, setShowOverlay] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  const imageSrc = useMemo(() => {
    const lines = buildReceiptLines(data.invoice);

    return renderReceiptImage(lines);
  }, [data.invoice]);

  useEffect(() => {
    if (!imageSrc) {
      return;
    }

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
  }, [imageSrc, onClose]);

  return createPortal(
    <>
      <style>{`
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          body > *:not(.print-receipt-wrapper) {
            display: none !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
          .print-receipt-wrapper {
            display: block !important;
            width: 80mm;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .print-receipt-wrapper img {
            display: block;
            width: 80mm;
            height: auto;
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
        style={{ display: 'none' }}
      >
        {imageSrc && <img src={imageSrc} alt="Receipt" />}
      </div>
    </>,
    document.body,
  );
}
