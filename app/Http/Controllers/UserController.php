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
            $user->delete();

            return redirect()->route('registration-codes.index')->with('success', 'User deleted successfully.');
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return redirect()->route('registration-codes.index')->with('error', 'You are not authorized to delete this user.');
        } catch (\Exception $e) {
            return redirect()->route('registration-codes.index')->with('error', 'Failed to delete the user: '.$e->getMessage());
        }
    }
}
