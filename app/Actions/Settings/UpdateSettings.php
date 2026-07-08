<?php

namespace App\Actions\Settings;

class UpdateSettings
{
    public function execute(array $data): void
    {
        settings()->set($data);
    }
}
