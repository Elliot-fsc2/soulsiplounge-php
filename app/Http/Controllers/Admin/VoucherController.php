<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Voucher\GenerateCode;
use App\Http\Requests\StoreVoucherRequest;
use App\Models\Voucher;

class VoucherController
{
    public function __construct(
        private GenerateCode $generateCode,
    ) {}

    public function index()
    {
        return Voucher::orderBy('created_at', 'desc')->get();
    }

    public function store(StoreVoucherRequest $request)
    {
        Voucher::create($request->validated());

        return redirect()->back()->with('success', 'Voucher created successfully!');
    }

    public function update(StoreVoucherRequest $request, Voucher $voucher)
    {
        $voucher->update($request->validated());

        return redirect()->back()->with('success', 'Voucher updated successfully!');
    }

    public function destroy(Voucher $voucher)
    {
        $voucher->delete();

        return redirect()->back()->with('success', 'Voucher deleted successfully!');
    }

    public function generateCode()
    {
        $code = $this->generateCode->execute();

        return response()->json(['code' => $code]);
    }
}
