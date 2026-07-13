<?php

/**
 * Local print agent for Soul Sip Lounge
 *
 * Run on the venue machine:
 *   php print-server.php
 *
 * The VPS will POST invoice data here for silent printing.
 */

use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;
use Mike42\Escpos\PrintConnectors\WindowsPrintConnector;
use Mike42\Escpos\Printer;
use Psr\Http\Message\ServerRequestInterface;
use React\EventLoop\Loop;
use React\Http\HttpServer;
use React\Http\Message\Response;
use React\Socket\SocketServer;

require __DIR__.'/vendor/autoload.php';

$host = '0.0.0.0';
$port = (int) ($argv[1] ?? 8080);

// Read env vars from server or .env
$printerPort = getenv('PRINTER_PORT') ?: 'ThermalPrinter';
$printerInterface = getenv('PRINTER_INTERFACE') ?: 'windows';
$paperWidth = (int) (getenv('PRINTER_PAPER_WIDTH') ?: 58);

$http = new HttpServer(function (ServerRequestInterface $request) use ($printerPort, $printerInterface, $paperWidth) {
    if ($request->getMethod() !== 'POST' || $request->getUri()->getPath() !== '/print') {
        return new Response(404, ['Content-Type' => 'application/json'], json_encode(['error' => 'Not found']));
    }

    $body = json_decode((string) $request->getBody(), true);

    if (! $body) {
        return new Response(400, ['Content-Type' => 'application/json'], json_encode(['error' => 'Invalid JSON']));
    }

    try {
        $connector = match ($printerInterface) {
            'windows' => new WindowsPrintConnector($printerPort),
            'network' => new NetworkPrintConnector($printerPort),
            default => throw new InvalidArgumentException("Unknown interface: $printerInterface"),
        };

        $printer = new Printer($connector);

        // Header
        $printer->setJustification(Printer::JUSTIFY_CENTER);
        $printer->selectPrintMode(Printer::MODE_DOUBLE_HEIGHT);
        $printer->text("SOULSIPS LOUNGE\n");
        $printer->selectPrintMode();
        $printer->text("An elevated social lounge\n");
        $printer->feed();

        // Invoice info
        $printer->setJustification(Printer::JUSTIFY_LEFT);
        $lineLen = $paperWidth === 58 ? 32 : 42;
        $printer->text(str_repeat('-', $lineLen)."\n");
        $printer->text("{$body['invoice_number']}\n");
        $printer->text(date('M d, Y h:i A')."\n");
        $printer->text("Staff: {$body['staff_name']}\n");

        if (! empty($body['room_name'])) {
            $printer->text("Room: {$body['room_name']}".(! empty($body['guest_count']) ? " ({$body['guest_count']} pax)" : '')."\n");
        }

        // Items
        $printer->text(str_repeat('-', $lineLen)."\n");

        foreach ($body['items'] as $item) {
            $line = $item['product_name'];
            $price = number_format($item['subtotal']);
            $spaces = max(1, $lineLen - strlen($line) - strlen($price));
            $printer->text("{$line}".str_repeat(' ', $spaces)."{$price}\n");

            if (($item['quantity'] ?? 1) > 1) {
                $detail = "  x{$item['quantity']} @ ".number_format($item['product_price']);
                $printer->text("{$detail}\n");
            }
        }

        // Totals
        $printer->text(str_repeat('-', $lineLen)."\n");
        $printer->setEmphasis(true);
        $label = 'TOTAL';
        $total = number_format($body['total']);
        $spaces = max(1, $lineLen - strlen($label) - strlen($total));
        $printer->text("{$label}".str_repeat(' ', $spaces)."{$total}\n");
        $printer->setEmphasis(false);

        if (! empty($body['payment_method'])) {
            $printer->text('Payment: '.strtoupper($body['payment_method'])."\n");
        }

        // Footer
        $printer->feed(2);
        $printer->setJustification(Printer::JUSTIFY_CENTER);
        $printer->text("Thank you!\n");
        $printer->text("Visit again :)\n");
        $printer->feed(3);
        $printer->cut();
        $printer->close();

        return new Response(200, ['Content-Type' => 'application/json'], json_encode(['success' => true]));
    } catch (Throwable $e) {
        file_put_contents(__DIR__.'/print-server-error.log', '['.date('c').'] '.$e->getMessage().PHP_EOL, FILE_APPEND);

        return new Response(500, ['Content-Type' => 'application/json'], json_encode(['error' => $e->getMessage()]));
    }
});

$loop = Loop::get();
$socket = new SocketServer("$host:$port", [], $loop);
$http->listen($socket);

echo "Print server listening on http://$host:$port\n";
echo "Printer: $printerInterface / $printerPort\n";

$loop->run();
