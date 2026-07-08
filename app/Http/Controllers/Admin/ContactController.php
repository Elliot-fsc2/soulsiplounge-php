<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContactStatus;
use App\Models\Contact;

class ContactController
{
    public function index()
    {
        return Contact::orderBy('created_at', 'desc')->get();
    }

    public function updateStatus(Contact $contact)
    {
        $validStatuses = ContactStatus::cases();
        $status = request()->input('status');

        if (! in_array($status, array_map(fn ($s) => $s->value, $validStatuses))) {
            return redirect()->back()->withErrors(['status' => 'Invalid status.']);
        }

        $contact->update(['status' => $status]);

        return redirect()->back()->with('success', 'Contact status updated!');
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();

        return redirect()->back()->with('success', 'Contact deleted successfully!');
    }
}
