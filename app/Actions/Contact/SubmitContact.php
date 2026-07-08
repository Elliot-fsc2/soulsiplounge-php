<?php

namespace App\Actions\Contact;

use App\Models\Contact;

class SubmitContact
{
    public function execute(array $data): Contact
    {
        return Contact::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'subject' => $data['subject'],
            'message' => $data['message'],
            'status' => 'New',
        ]);
    }
}
