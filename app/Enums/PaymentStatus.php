<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'Pending';
    case Confirmed = 'Confirmed';
    case Cancelled = 'Cancelled';
    case Refunded = 'Refunded';
    case Failed = 'Failed';
}
