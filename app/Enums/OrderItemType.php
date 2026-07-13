<?php

namespace App\Enums;

enum OrderItemType: string
{
    case Product = 'product';
    case RoomCharge = 'room_charge';
    case Custom = 'custom';
}
