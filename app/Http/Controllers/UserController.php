<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        try {
            Gate::authorize('delete', $user);
            $name = $user->name;
            $user->delete();

            return redirect()->route('registration-codes.index')->with('success', "\"$name\" wurde gelöscht.");
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return redirect()->route('registration-codes.index')->with('error', $e->getMessage());
        } catch (\Exception $e) {
            return redirect()->route('registration-codes.index')->with('error', 'Nutzer konnte nicht gelöscht werden: '.$e->getMessage());
        }
    }
}
