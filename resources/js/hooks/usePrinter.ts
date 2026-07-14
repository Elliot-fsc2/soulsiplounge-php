import { useState, useCallback, useEffect, useRef } from 'react';

export type PrinterStatus = 'disconnected' | 'connecting' | 'connected';

const BAUDRATE = 9600;

interface PortRef {
  port: SerialPort | null;
}

const ref: PortRef = { port: null };

export function usePrinter() {
  const [status, setStatus] = useState<PrinterStatus>('disconnected');
  const [isSupported, setIsSupported] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    setIsSupported('serial' in navigator);
    return () => { mounted.current = false; };
  }, []);

  const updateStatus = useCallback((s: PrinterStatus) => {
    if (mounted.current) setStatus(s);
  }, []);

  const connect = useCallback(async () => {
    if (!('serial' in navigator)) throw new Error('Web Serial not supported.');

    updateStatus('connecting');

    try {
      const port = await navigator.serial.requestPort();
      ref.port = port;
      updateStatus('connected');
    } catch (err) {
      updateStatus('disconnected');
      throw err;
    }
  }, [updateStatus]);

  const disconnect = useCallback(async () => {
    try {
      if (ref.port?.readable) await ref.port.close();
    } catch { /* ignore */ }
    ref.port = null;
    updateStatus('disconnected');
  }, [updateStatus]);

  const print = useCallback(async (data: Uint8Array): Promise<void> => {
    const port = ref.port;
    if (!port) throw new Error('No printer paired. Click Connect first.');

    try {
      await port.open({ baudRate: BAUDRATE });

      const writer = port.writable!.getWriter();
      await writer.write(data);
      writer.releaseLock();

      await port.close();
    } catch (err) {
      updateStatus('disconnected');
      throw err;
    }
  }, [updateStatus]);

  const reconnect = useCallback(async () => {
    if (!('serial' in navigator)) return;

    try {
      const ports = await navigator.serial.getPorts();
      if (ports.length === 0) return;

      ref.port = ports[0];
      updateStatus('connected');
    } catch { /* silent */ }
  }, [updateStatus]);

  useEffect(() => { reconnect(); }, [reconnect]);

  return { connect, disconnect, reconnect, print, status, isSupported };
}
