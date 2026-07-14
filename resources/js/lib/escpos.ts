const COLUMNS = 32;
const encoder = new TextEncoder();

function center(text: string): string {
  const spaces = Math.max(0, COLUMNS - text.length);
  const leftPad = Math.floor(spaces / 2);
  return ' '.repeat(leftPad) + text;
}

function leftRight(left: string, right: string): string {
  const content = left + right;
  if (content.length >= COLUMNS) {
    return left.substring(0, COLUMNS - right.length - 1) + ' ' + right;
  }
  return left + ' '.repeat(COLUMNS - content.length) + right;
}

function line(text = ''): string {
  return text + '\n';
}

function separator(): string {
  return '-'.repeat(COLUMNS) + '\n';
}

function textBytes(str: string): Uint8Array {
  return encoder.encode(str);
}

function esc(...bytes: number[]): Uint8Array {
  return new Uint8Array(bytes);
}

const INIT = esc(0x1B, 0x40);
const CENTER = esc(0x1B, 0x61, 0x01);
const LEFT = esc(0x1B, 0x61, 0x00);
const DOUBLE_HEIGHT = esc(0x1B, 0x21, 0x08);
const NORMAL = esc(0x1B, 0x21, 0x00);
const BOLD_ON = esc(0x1B, 0x45, 0x01);
const BOLD_OFF = esc(0x1B, 0x45, 0x00);
const CUT = esc(0x1D, 0x56, 0x00);
const FEED = (n: number) => esc(0x1B, 0x64, n);
const LF = esc(0x0A);

function concat(...parts: (Uint8Array | string)[]): Uint8Array {
  const encoded = parts.map((p) => (typeof p === 'string' ? textBytes(p) : p));
  const totalLength = encoded.reduce((sum, p) => sum + p.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const p of encoded) {
    result.set(p, offset);
    offset += p.length;
  }
  return result;
}

export interface PrintInvoiceItem {
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface PrintInvoiceData {
  invoice_number: string;
  created_at: string;
  staff_name: string;
  room_name: string | null;
  guest_count: number | null;
  subtotal: number;
  total: number;
  amount_tendered: number | null;
  change: number | null;
  payment_method: string | null;
  items: PrintInvoiceItem[];
}

export interface PrintData {
  invoice: PrintInvoiceData;
  print_kitchen_chit: boolean;
}

function formatAmount(n: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-PH', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }) + ' ' + d.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function buildReceipt(invoice: PrintInvoiceData): Uint8Array {
  const totalFormatted = formatAmount(invoice.total);
  const lines: string[] = [];

  lines.push(center('SOULSIPS LOUNGE'));
  lines.push(center('An elevated social lounge'));
  lines.push('');
  lines.push(separator().trimEnd());
  lines.push(invoice.invoice_number);
  lines.push(formatDate(invoice.created_at));
  lines.push('Staff: ' + invoice.staff_name);
  if (invoice.room_name) {
    const roomLine = 'Room: ' + invoice.room_name;
    lines.push(invoice.guest_count ? roomLine + ' (' + invoice.guest_count + ' pax)' : roomLine);
  }
  lines.push(separator().trimEnd());

  for (const item of invoice.items) {
    const price = formatAmount(item.subtotal);
    lines.push(leftRight(item.product_name, price));
    if (item.quantity > 1) {
      lines.push('  x' + item.quantity + ' @ ' + formatAmount(item.product_price));
    }
  }

  lines.push(separator().trimEnd());
  lines.push(leftRight('TOTAL', totalFormatted));

  if (invoice.payment_method) {
    lines.push('Payment: ' + invoice.payment_method.toUpperCase());
  }
  if (invoice.amount_tendered !== null) {
    lines.push('Cash: ' + formatAmount(invoice.amount_tendered));
  }
  if (invoice.change !== null) {
    lines.push('Change: ' + formatAmount(invoice.change));
  }

  const divider = separator().trimEnd();
  const receiptStr = lines.join('\n') + '\n';
  const footer = center(divider) + '\n' + center('THIS IS NOT AN OFFICIAL RECEIPT') + '\n' + center(divider) + '\n';
  const closing = center('Thank you!') + '\n' + center('Visit again :)') + '\n';

  return concat(
    INIT,
    CENTER,
    DOUBLE_HEIGHT,
    textBytes(center('SOULSIPS LOUNGE') + '\n'),
    NORMAL,
    textBytes(center('An elevated social lounge') + '\n'),
    LF,
    LEFT,
    textBytes(receiptStr),
    CENTER,
    textBytes(footer),
    textBytes(closing),
    FEED(3),
    CUT,
  );
}

export interface KitchenChitItem {
  product_name: string;
  quantity: number;
}

export interface KitchenChitData {
  order_number: string;
  created_at: string;
  room_name: string | null;
  items: KitchenChitItem[];
}

export function buildKitchenChit(data: KitchenChitData): Uint8Array {
  const d = new Date(data.created_at);
  const time = d.toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const lines: string[] = [];
  lines.push('Time: ' + time);
  if (data.room_name) {
    lines.push('Room: ' + data.room_name);
  }
  lines.push(separator().trimEnd());
  for (const item of data.items) {
    lines.push('x' + item.quantity + ' ' + item.product_name);
  }

  return concat(
    INIT,
    CENTER,
    DOUBLE_HEIGHT,
    textBytes(center('KITCHEN ORDER') + '\n'),
    NORMAL,
    textBytes(center(data.order_number) + '\n'),
    LF,
    LEFT,
    textBytes(lines.join('\n') + '\n'),
    FEED(3),
    CUT,
  );
}

export function buildTestPage(): Uint8Array {
  return concat(
    INIT,
    CENTER,
    DOUBLE_HEIGHT,
    textBytes(center('SOULSIPS LOUNGE') + '\n'),
    NORMAL,
    textBytes(center('Printer Test Page') + '\n'),
    LF,
    textBytes(center('If you can read this,') + '\n'),
    textBytes(center('your printer is working!') + '\n'),
    FEED(3),
    CUT,
  );
}
