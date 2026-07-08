<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Settings\UpdateSettings;
use Illuminate\Http\Request;

class SettingsController
{
    public function __construct(
        private UpdateSettings $updateSettings,
    ) {}

    public function update(Request $request)
    {
        $this->updateSettings->execute($request->all());

        return redirect()->back()->with('success', 'Settings updated successfully!');
    }
}
