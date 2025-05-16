<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's role as an enum.
     */
    public function getRoleAttribute(): UserRole
    {
        return UserRole::from($this->attributes['role']);
    }

    /**
     * Set the user's role from an enum.
     */
    public function setRoleAttribute(UserRole $role): void
    {
        $this->attributes['role'] = $role->value;
    }

    /**
     * Get the invitation codes created by the admin.
     */
    public function createdInvitationCodes(): HasMany
    {
        return $this->hasMany(InvitationCode::class, 'admin_id');
    }

    /**
     * Get the invitation code associated with an editor.
     */
    public function invitationCode(): HasOne
    {
        return $this->hasOne(InvitationCode::class, 'editor_id');
    }
}
