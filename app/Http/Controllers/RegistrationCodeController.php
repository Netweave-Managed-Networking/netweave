<?php

namespace App\Http\Controllers;

use App\Models\RegistrationCode;
use App\Models\User;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationCodeController extends Controller
{
    public function index(Request $request): Response
    {
        $registrationCodes = RegistrationCode::with('admin:id,name,email')
            ->with('editor:id,name,email')
            ->orderByRaw('CASE WHEN editor_id IS NULL THEN 0 ELSE 1 END')
            ->orderBy('created_at', 'desc')
            ->orderBy('editor_id', 'desc')
            ->get();

        return Inertia::render('RegistrationCodes/RegistrationCodesTable', [
            'registrationCodes' => $registrationCodes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var User */
        $admin = $request->user();
        $code = Str::lower(Str::random(length: 8)); // Random 8-character code like 'ab123cde'
        RegistrationCode::create([
            'code' => $code,
            'admin_id' => $admin->id,
        ]);

        return redirect()->route('registration-codes.index');
    }

    public function destroy(Request $request, RegistrationCode $registrationCode): RedirectResponse
    {
        try {
            $registrationCode->delete();

            return redirect()->route('registration-codes.index')->with('success', 'Registration code deleted successfully.');
        } catch (Exception $e) {
            return redirect()->route('registration-codes.index')->with('error', $e->getMessage());
        }

    }
}
