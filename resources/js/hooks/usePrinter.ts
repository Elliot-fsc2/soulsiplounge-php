import { useState, useCallback, useEffect, useRef } from 'react';

export type PrinterStatus = 'disconnected' | 'connecting' | 'connected';

const BAUDRATE = 9600;

let savedPort: SerialPort | null = null;

export function usePrinter() {
  const [status, setStatus] = useState<PrinterStatus>('disconnected');
  const [isSupported, setIsSupported] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    setIsSupported('serial' in navigator);
    return () => { mounted.current = false; };
  }, []);

  const connect = useCallback(async () => {
    if (!('serial' in navigator)) throw new Error('Web Serial not supported.');
    setStatus('connecting');
    try {
      const port = await navigator.serial.requestPort();
      savedPort = port;
      setStatus('connected');
    } catch {
      setStatus('disconnected');
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (savedPort?.readable) await savedPort.close();
    } catch { /* ignore */ }
    savedPort = null;
    setStatus('disconnected');
  }, []);

  const print = useCallback(async (data: Uint8Array): Promise<void> => {
    if (!savedPort) throw new Error('No printer paired.');
    try {
      await savedPort.open({ baudRate: BAUDRATE });
      const writer = savedPort.writable!.getWriter();
      await writer.write(data);
      writer.releaseLock();
      await savedPort.close();
    } catch (err) {
      setStatus('disconnected');
      throw err;
    }
  }, []);

  const getSavedPorts = useCallback(async () => {
    if (!('serial' in navigator)) return;
    try {
      const ports = await navigator.serial.getPorts();
      if (ports.length === 0) return;
      savedPort = ports[0];
      setStatus('connected');
    } catch { /* silent */ }
  }, []);

  useEffect(() => { getSavedPorts(); }, [getSavedPorts]);

  return { connect, disconnect, print, status, isSupported };
}
