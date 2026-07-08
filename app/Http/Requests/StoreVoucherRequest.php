<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $voucherId = $this->route('voucher')?->id;

        return [
            'code' => ['sometimes', 'required', 'string', 'unique:vouchers,code'.($voucherId ? ','.$voucherId : ''), 'max:20'],
            'type' => ['sometimes', 'required', 'string', 'in:percentage,fixed'],
            'value' => ['sometimes', 'required', 'integer', 'min:1'],
            'min_purchase' => ['sometimes', 'required', 'integer', 'min:0'],
            'max_uses' => ['sometimes', 'required', 'integer', 'min:0'],
            'expires_at' => ['nullable', 'date'],
            'active' => ['boolean'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }
}
