<?php

namespace App\Http\Controllers;

use App\Models\OrganizationNotes;
use Illuminate\Http\Request;

class OrganizationNotesController extends Controller
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
    public function update(Request $request, OrganizationNotes $organizationNotes)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OrganizationNotes $organizationNotes)
    {
        //
    }
}
