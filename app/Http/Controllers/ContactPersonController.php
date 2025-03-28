<?php

namespace App\Http\Controllers;

use App\Models\ContactPerson;
use Illuminate\Http\Request;

class ContactPersonController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // storing is happening in the OrganizationController
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ContactPerson $contactPerson)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ContactPerson $contactPerson)
    {
        //
    }
}
