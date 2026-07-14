import { useState, useCallback, useEffect, useRef } from 'react';

type PrinterStatus = 'disconnected' | 'connecting' | 'connected';

interface SerialPortRef {
  port: SerialPort | null;
  reader: ReadableStreamDefaultReader | null;
}

const portRef: SerialPortRef = { port: null, reader: null };

export function usePrinter() {
  const [status, setStatus] = useState<PrinterStatus>('disconnected');
  const [isSupported, setIsSupported] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    setIsSupported('serial' in navigator);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reconnect = useCallback(async () => {
    if (!('serial' in navigator)) return;

    try {
      const ports = await navigator.serial.getPorts();
      if (ports.length === 0) return;

      setStatus('connecting');
      await openPort(ports[0]);
    } catch {
      // Silent fail — user can pair manually
    }
  }, []);

  useEffect(() => {
    reconnect();
  }, [reconnect]);

  const connect = useCallback(async () => {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial is not supported in this browser.');
    }

    setStatus('connecting');

    try {
      const port = await navigator.serial.requestPort();
      await openPort(port);
    } catch (err) {
      setStatus('disconnected');
      throw err;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (portRef.reader) {
        await portRef.reader.cancel();
        portRef.reader = null;
      }
      if (portRef.port && portRef.port.readable) {
        await portRef.port.close();
      }
    } catch {
      // Ignore close errors
    }

    portRef.port = null;
    if (mountedRef.current) {
      setStatus('disconnected');
    }
  }, []);

  const print = useCallback(async (data: Uint8Array): Promise<boolean> => {
    if (!portRef.port) {
      throw new Error('Printer not connected. Please pair a printer first.');
    }

    try {
      if (!portRef.port.readable) {
        await openPort(portRef.port);
      }

      const writer = portRef.port.writable!.getWriter();
      await writer.write(data);
      writer.releaseLock();

      return true;
    } catch (err) {
      if (mountedRef.current) {
        setStatus('disconnected');
      }
      throw err;
    }
  }, []);

  return { connect, disconnect, reconnect, print, status, isSupported };
}

async function openPort(port: SerialPort): Promise<void> {
  await port.open({ baudRate: 9600 });
  portRef.port = port;
}
