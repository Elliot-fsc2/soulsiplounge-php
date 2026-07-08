<?php

namespace App\Http\Controllers\Public;

use App\Actions\Contact\SubmitContact;
use App\Http\Requests\StoreContactRequest;
use Illuminate\Http\RedirectResponse;

class ContactController
{
    public function __construct(
        private SubmitContact $submitContact,
    ) {}

    public function store(StoreContactRequest $request): RedirectResponse
    {
        $this->submitContact->execute($request->validated());

        return redirect()->route('home')
            ->with('success', 'Message sent successfully!');
    }
}
