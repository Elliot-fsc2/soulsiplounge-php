<?php

namespace App\Services;

use App\Models\Order;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Mike42\Escpos\Printer;

class PrinterService
{
    private ?string $connectionType;

    private ?string $port;

    private ?string $interface;

    private ?string $characterEncoding;

    private int $paperWidth;

    public function __construct()
    {
        $config = config('printer');
        $this->connectionType = $config['connection_type'] ?? 'usb';
        $this->port = $config['port'] ?? 'COM3';
        $this->interface = $config['interface'] ?? 'windows';
        $this->characterEncoding = $config['character_encoding'] ?? 'CP437';
        $this->paperWidth = $config['paper_width'] ?? 58;
    }

    public function printReceipt(Order $order): bool
    {
        try {
            $connector = $this->getConnector();
            $printer = new Printer($connector);

            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->selectPrintMode(Printer::MODE_DOUBLE_HEIGHT);
            $printer->text("SOULSIPS LOUNGE\n");
            $printer->selectPrintMode();
            $printer->text("An elevated social lounge\n");
            $printer->feed();

            $printer->setJustification(Printer::JUSTIFY_LEFT);
            $printer->text(str_repeat('-', $this->paperWidth === 58 ? 32 : 42)."\n");

            $printer->text("{$order->order_number}\n");
            $printer->text($order->created_at->format('M d, Y h:i A')."\n");
            $printer->text("Staff: {$order->user->name}\n");

            if ($order->room_id) {
                $room = $order->room;
                $printer->text("Room: {$room->name}".($order->guest_count ? " ({$order->guest_count} pax)" : '')."\n");
            }

            $printer->text(str_repeat('-', $this->paperWidth === 58 ? 32 : 42)."\n");

            foreach ($order->items as $item) {
                $line = "{$item->product_name}";
                $price = number_format($item->subtotal);
                $spaces = max(1, ($this->paperWidth === 58 ? 32 : 42) - strlen($line) - strlen($price));
                $printer->text("{$line}".str_repeat(' ', $spaces)."{$price}\n");

                if ($item->quantity > 1) {
                    $detail = "  x{$item->quantity} @ ".number_format($item->product_price);
                    $printer->text("{$detail}\n");
                }
            }

            $printer->text(str_repeat('-', $this->paperWidth === 58 ? 32 : 42)."\n");

            $printer->setEmphasis(true);
            $label = 'TOTAL';
            $total = number_format($order->total);
            $spaces = max(1, ($this->paperWidth === 58 ? 32 : 42) - strlen($label) - strlen($total));
            $printer->text("{$label}".str_repeat(' ', $spaces)."{$total}\n");
            $printer->setEmphasis(false);

            if ($order->payment_method) {
                $printer->text('Payment: '.strtoupper($order->payment_method)."\n");
            }

            $printer->feed(2);
            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->text("Thank you!\n");
            $printer->text("Visit again :)\n");
            $printer->feed(3);
            $printer->cut();

            $printer->close();

            return true;
        } catch (\Exception $e) {
            logger()->error('Printer error: '.$e->getMessage());

            return false;
        }
    }

    public function printKitchenChit(Order $order): bool
    {
        try {
            $connector = $this->getConnector();
            $printer = new Printer($connector);

            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->selectPrintMode(Printer::MODE_DOUBLE_HEIGHT);
            $printer->text("KITCHEN ORDER\n");
            $printer->selectPrintMode();
            $printer->text($order->order_number."\n");
            $printer->feed();

            $printer->setJustification(Printer::JUSTIFY_LEFT);
            $printer->text('Time: '.$order->created_at->format('h:i A')."\n");

            if ($order->room_id) {
                $room = $order->room;
                $printer->text("Room: {$room->name}\n");
            }

            $printer->text(str_repeat('-', $this->paperWidth === 58 ? 32 : 42)."\n");

            foreach ($order->items as $item) {
                $printer->text("x{$item->quantity} {$item->product_name}\n");
            }

            $printer->feed(3);
            $printer->cut();

            $printer->close();

            return true;
        } catch (\Exception $e) {
            logger()->error('Kitchen printer error: '.$e->getMessage());

            return false;
        }
    }

    public function printTestPage(): bool
    {
        try {
            $connector = $this->getConnector();
            $printer = new Printer($connector);

            $printer->setJustification(Printer::JUSTIFY_CENTER);
            $printer->selectPrintMode(Printer::MODE_DOUBLE_HEIGHT);
            $printer->text("SOULSIPS LOUNGE\n");
            $printer->selectPrintMode();
            $printer->text("Printer Test Page\n");
            $printer->feed();
            $printer->text("If you can read this,\n");
            $printer->text("your printer is working!\n");
            $printer->feed(3);
            $printer->cut();

            $printer->close();

            return true;
        } catch (\Exception $e) {
            logger()->error('Test print error: '.$e->getMessage());

            return false;
        }
    }

    public function getStatus(): string
    {
        try {
            $connector = $this->getConnector();
            $printer = new Printer($connector);
            $printer->close();

            return 'connected';
        } catch (\Exception $e) {
            return 'disconnected';
        }
    }

    private function getConnector(): mixed
    {
        return match ($this->interface) {
            'windows' => new WindowsPrintConnector($this->port),
            'network' => new NetworkPrintConnector($this->port),
            default => throw new \InvalidArgumentException("Unknown printer interface: {$this->interface}"),
        };
    }
}
