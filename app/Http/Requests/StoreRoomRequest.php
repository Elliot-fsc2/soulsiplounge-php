<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:2048'],
            'image_file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            'description' => ['nullable', 'string', 'max:5000'],
            'min_group' => ['required', 'integer', 'min:1'],
            'max_group' => ['required', 'integer', 'min:1'],
            'pricing' => ['required', 'json'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}
