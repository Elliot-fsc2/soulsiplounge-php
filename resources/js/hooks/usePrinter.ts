import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export type PrinterStatus = 'disconnected' | 'connecting' | 'connected';
export type ConnectionType = 'serial' | 'usb' | null;

const BAUDRATE = 9600;

let savedPort: SerialPort | null = null;
interface USBDevice {
  open(): Promise<void>;
  selectConfiguration(n: number): Promise<void>;
  claimInterface(n: number): Promise<void>;
  clearHalt(direction: 'in' | 'out', endpointNumber: number): Promise<void>;
  transferOut(endpointNumber: number, data: Uint8Array): Promise<unknown>;
  close(): Promise<void>;
}
let usbDevice: USBDevice | null = null;

export function usePrinter() {
  const [status, setStatus] = useState<PrinterStatus>('disconnected');
  const [connectionType, setConnectionType] = useState<ConnectionType>(null);
  const [isSerialSupported, setIsSerialSupported] = useState(false);
  const [isUsbSupported, setIsUsbSupported] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    setIsSerialSupported('serial' in navigator);
    setIsUsbSupported('usb' in navigator);

    navigator.serial.getPorts().then((ports) => {
      if (!mounted.current) return;
      if (ports.length === 0) return;
      savedPort = ports[0];
      setConnectionType('serial');
      setStatus('connected');
    });

    return () => { mounted.current = false; };
  }, []);

  async function connectSerial() {
    if (!('serial' in navigator)) throw new Error('Web Serial not supported.');
    setStatus('connecting');
    try {
      const port = await navigator.serial.requestPort({
        allowedBluetoothServiceClassIds: [
          '00001101-0000-1000-8000-00805f9b34fb',
        ],
        filters: [{
          bluetoothServiceClassId: '00001101-0000-1000-8000-00805f9b34fb',
        }],
      });
      savedPort = port;
      usbDevice = null;
      setConnectionType('serial');
      setStatus('connected');
    } catch {
      setStatus('disconnected');
      toast.error('Printer connection cancelled or failed');
    }
  }

  function usb(): { requestDevice(opts: { filters: unknown[] }): Promise<USBDevice> } {
    return (navigator as unknown as { usb: ReturnType<typeof usb> }).usb;
  }

  async function connectUSB() {
    if (!('usb' in navigator)) throw new Error('WebUSB not supported.');
    setStatus('connecting');
    try {
      const device = await usb().requestDevice({ filters: [] });
      await device.open();
      await device.selectConfiguration(1);
      let claimed = false;
      for (const n of [0, 1, 2]) {
        try { await device.claimInterface(n); claimed = true; break; } catch { /* try next */ }
      }
      if (!claimed) throw new Error('Could not claim any USB interface');
      usbDevice = device;
      savedPort = null;
      setConnectionType('usb');
      setStatus('connected');
    } catch (err) {
      setStatus('disconnected');
      const message = err instanceof Error ? err.message : '';
      toast.error(message || 'USB connection failed');
    }
  }

  async function disconnect() {
    if (usbDevice) {
      try { await usbDevice.close(); } catch { /* ignore */ }
      usbDevice = null;
    }
    if (savedPort) {
      try { if (savedPort.readable) await savedPort.close(); } catch { /* ignore */ }
      savedPort = null;
    }
    setConnectionType(null);
    setStatus('disconnected');
  }

  async function print(data: Uint8Array): Promise<void> {
    if (connectionType === 'usb' && usbDevice) {
      try {
        await usbDevice.clearHalt('out', 1);
        const result = await usbDevice.transferOut(1, data);
        console.log('USB write result:', result);
        return;
      } catch (err) {
        setStatus('disconnected');
        toast.error(err instanceof Error ? err.message : 'USB print failed');
        throw err;
      }
    }

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

  return {
    connectSerial, connectUSB, disconnect, print,
    status, connectionType,
    isSerialSupported, isUsbSupported,
  };
}
