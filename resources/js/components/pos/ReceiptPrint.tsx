import { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { PrintData } from '@/lib/escpos';

interface Props {
  data: PrintData;
  onClose: () => void;
}

const COLS = 30;

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

const CANVAS_WIDTH = 960;
const FONT_SIZE = 38;
const CHAR_HEIGHT = 54;
const PAD_X = 40;
const PAD_Y = 48;

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

function buildPrintHtml(imageSrc: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: 80mm auto; margin: 0; }
  body { margin: 0; padding: 2mm; background: #fff; }
  img { display: block; width: 76mm; height: auto; margin: 0 auto; }
</style>
</head>
<body><img src="${imageSrc}" alt="Receipt" /></body>
</html>`;
}

export default function ReceiptPrint({ data, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const imageSrc = useMemo(() => {
    const lines = buildReceiptLines(data.invoice);

    return renderReceiptImage(lines);
  }, [data.invoice]);

  useEffect(() => {
    if (!imageSrc) {
      return;
    }

    const iframe = iframeRef.current;

    if (!iframe) {
      return;
    }

    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(buildPrintHtml(imageSrc));
    doc.close();

    const triggerPrint = () => {
      setTimeout(() => {
        const win = iframe.contentWindow;

        if (!win) {
          return;
        }

        win.addEventListener('afterprint', () => {
          setTimeout(onClose, 500);
        }, { once: true });

        win.print();
      }, 500);
    };

    const img = doc.querySelector('img');

    if (img && img.complete) {
      triggerPrint();
    } else if (img) {
      img.onload = triggerPrint;
    }
  }, [imageSrc, onClose]);

  return createPortal(
    <iframe
      ref={iframeRef}
      style={{ position: 'absolute', width: 0, height: 0, border: 'none' }}
      title="Receipt Print"
    />,
    document.body,
  );
}
