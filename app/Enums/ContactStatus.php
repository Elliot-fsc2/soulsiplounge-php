<?php

namespace App\Enums;

enum ContactStatus: string
{
    case New = 'New';
    case Read = 'Read';
    case Archived = 'Archived';
}
