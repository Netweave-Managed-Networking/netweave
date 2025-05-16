<?php

namespace App\Http\Controllers;

use App\Models\InvitationCode;
use App\Models\User;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InvitationCodeController extends Controller
{
    public function index(Request $request): Response
    {
        $invitationCodes = InvitationCode::with('admin:id,name,email')
            ->with('editor:id,name,email')
            ->orderByRaw('CASE WHEN editor_id IS NULL THEN 0 ELSE 1 END')
            ->orderBy('created_at', 'desc')
            ->orderBy('editor_id', 'desc')
            ->get();

        return Inertia::render('invitation-codes/invitation-codes-page', [
            'invitationCodes' => $invitationCodes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var User */
        $admin = $request->user();
        $code = Str::lower(Str::random(length: 8)); // Random 8-character code like 'ab123cde'
        InvitationCode::create([
            'code' => $code,
            'admin_id' => $admin->id,
        ]);

        return redirect()->route('invitation-codes.index')->with('success', 'Neuer Einladungscode erstellt.');
    }

    public function destroy(Request $request, InvitationCode $invitationCode): RedirectResponse
    {
        try {
            $invitationCode->delete();

            return redirect()->route('invitation-codes.index')->with('success', 'Einladungscode gelöscht.');
        } catch (Exception $e) {
            return redirect()->route('invitation-codes.index')->with('error', $e->getMessage());
        }

    }
}
