import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export type PrinterStatus = 'disconnected' | 'connecting' | 'connected';

const BAUDRATE = 9600;

let savedPort: SerialPort | null = null;

export function usePrinter() {
  const [status, setStatus] = useState<PrinterStatus>('disconnected');
  const [isSupported, setIsSupported] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    setIsSupported('serial' in navigator);

    navigator.serial.getPorts().then((ports) => {
      if (!mounted.current) return;
      if (ports.length === 0) return;
      savedPort = ports[0];
      setStatus('connected');
    });

    return () => { mounted.current = false; };
  }, []);

  async function connect() {
    if (!('serial' in navigator)) throw new Error('Web Serial not supported.');
    setStatus('connecting');
    try {
      const port = await navigator.serial.requestPort({
        allowedBluetoothServiceClassIds: [
          '00001200-0000-1000-8000-00805f9b34fb',
        ],
      });
      savedPort = port;
      setStatus('connected');
    } catch {
      setStatus('disconnected');
      toast.error('Printer connection cancelled or failed');
    }
  }

  async function disconnect() {
    try {
      if (savedPort?.readable) await savedPort.close();
    } catch { /* ignore */ }
    savedPort = null;
    setStatus('disconnected');
  }

  async function print(data: Uint8Array): Promise<void> {
    if (!savedPort) throw new Error('No printer paired.');
    try {
      await savedPort.open({ baudRate: BAUDRATE });
      const writer = savedPort.writable!.getWriter();
      await writer.write(data);
      writer.releaseLock();
      await savedPort.close();
    } catch (err) {
      setStatus('disconnected');
      toast.error(err instanceof Error ? err.message : 'Print failed');
      throw err;
    }
  }

  return { connect, disconnect, print, status, isSupported };
}
