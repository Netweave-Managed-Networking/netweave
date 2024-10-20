<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class StakeholderOrganization extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'stakeholder_organizations';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'postcode_city',
        'street_hnr',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        // No sensitive attributes to hide in this model
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // No special casting needed for this model
    ];

    /**
     * Get the organizations that this organization stated. (That this organization knows, not knows, ….)
     */
    public function stakeholderCategories(): BelongsToMany
    {
        return $this->belongsToMany(StakeholderCategory::class,
            'stakeholder_to_category',
            'stakeholder_organization_id',
            'stakeholder_category_id',
        );
    }

    //////////////////////////
    // ↓ NETWORK ANALYSIS ↓ //
    //////////////////////////

    /**
     * Get the organizations that this organization stated. (That this organization knows, not knows, ….)
     */
    public function statedOrganizations(): BelongsToMany
    {
        return $this->belongsToMany(
            StakeholderOrganization::class,
            'stakeholder_to_stakeholder',
            'stakeholder_stating_id',
            'stakeholder_stated_id'
        )->withPivot('type', 'conflict')->withTimestamps();
    }

    /**
     * Get the organizations that stated this organization. (That know/do not know/… this organization.)
     */
    public function statingOrganizations(): BelongsToMany
    {
        return $this->belongsToMany(
            StakeholderOrganization::class,
            'stakeholder_to_stakeholder',
            'stakeholder_stated_id',
            'stakeholder_stating_id'
        )->withPivot('type', 'conflict')->withTimestamps();
    }

    //////////////////////////
    // ↑ NETWORK ANALYSIS ↑ //
    //////////////////////////
}
