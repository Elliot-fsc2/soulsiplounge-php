<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\StoreBankAccountRequest;
use App\Models\BankAccount;
use Illuminate\Support\Facades\Storage;

class BankAccountController
{
    public function index()
    {
        return BankAccount::orderBy('bank_name')->get();
    }

    public function store(StoreBankAccountRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('qr_file')) {
            $data['qr_code_url'] = $request->file('qr_file')->store('qr-codes', 'public');
        }

        BankAccount::create($data);

        return redirect()->back()->with('success', 'Bank account added successfully!');
    }

    public function update(StoreBankAccountRequest $request, BankAccount $bankAccount)
    {
        $data = $request->validated();

        if ($request->hasFile('qr_file')) {
            if ($bankAccount->qr_code_url) {
                Storage::disk('public')->delete($bankAccount->qr_code_url);
            }
            $data['qr_code_url'] = $request->file('qr_file')->store('qr-codes', 'public');
        }

        $bankAccount->update($data);

        return redirect()->back()->with('success', 'Bank account updated successfully!');
    }

    public function destroy(BankAccount $bankAccount)
    {
        if ($bankAccount->qr_code_url) {
            Storage::disk('public')->delete($bankAccount->qr_code_url);
        }

        $bankAccount->delete();

        return redirect()->back()->with('success', 'Bank account removed successfully!');
    }
}
