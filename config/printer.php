<?php

return [
    'connection_type' => env('PRINTER_CONNECTION_TYPE', 'usb'),
    'port' => env('PRINTER_PORT', 'COM3'),
    'interface' => env('PRINTER_INTERFACE', 'windows'),
    'character_encoding' => env('PRINTER_CHARACTER_ENCODING', 'CP437'),
    'paper_width' => (int) env('PRINTER_PAPER_WIDTH', 58),
    'print_kitchen_chit' => (bool) env('PRINTER_PRINT_KITCHEN_CHIT', true),

    
];
