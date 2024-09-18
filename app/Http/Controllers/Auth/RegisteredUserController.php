<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\RegistrationCode;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'registration_code' => ['required', 'string', $this->getValidRegCodeExistsRule()],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        /** @var \App\Models\User */
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $this->invalidateRegistrationCodeAfterSuccessfulRegistration($validated['registration_code'], $user->id);
        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }

    private function getValidRegCodeExistsRule()
    {
        // case insensitive
        return Rule::exists('registration_codes', 'code')->where(fn (Builder $query) => $query->where('editor_id', null));
    }

    private function invalidateRegistrationCodeAfterSuccessfulRegistration(string $code, $editorId)
    {
        /** @var RegistrationCode */
        $registration_code = RegistrationCode::where('code', $code)->first();
        $registration_code->editor_id = $editorId;
        $registration_code->save();
    }
}
