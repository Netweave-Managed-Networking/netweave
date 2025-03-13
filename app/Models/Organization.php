<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Collection;

class Organization extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'organizations';

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
     * Get the categories that belong to the organization.
     */
    public function organizationCategories(): BelongsToMany
    {
        return $this->belongsToMany(OrganizationCategory::class, 'organization_to_category');
    }

    // //////////////////////// //
    // / ↓ NOTES & CRITERIA ↓ / //
    // //////////////////////// //

    /**
     * @example use as $organization->notes?->notes;
     */
    public function notes(): HasOne
    {
        return $this->hasOne(OrganizationNotes::class);
    }

    /**
     * @example use as $organization->coopCriteria?->for_coop;
     * @example use as $organization->coopCriteria?->ko_no_coop;
     */
    public function coopCriteria(): HasOne
    {
        return $this->hasOne(OrganizationCoopCriteria::class);
    }

    // //////////////////////////////// //
    // / ↓ RESOURCES & REQUIREMENTS ↓ / //
    // //////////////////////////////// //

    public function resources(): HasMany
    {
        return $this->hasMany(Resource::class)->where('type', 'resource');
    }

    public function requirements(): HasMany
    {
        return $this->hasMany(Resource::class)->where('type', 'requirement');
    }

    public function getResourceCategories(): Collection
    {
        return $this->getCategoriesOfResources($this->resources());
    }

    public function getRequirementCategories(): Collection
    {
        return $this->getCategoriesOfResources($this->requirements());
    }

    // //////////////////////////////// //
    // / ↑ RESOURCES & REQUIREMENTS ↑ / //
    // //////////////////////////////// //

    // //////////////////////// //
    // / ↓ NETWORK ANALYSIS ↓ / //
    // //////////////////////// //

    /**
     * Get the organizations that this organization stated. (That this organization knows, not knows, ….)
     */
    public function statedOrganizations(): BelongsToMany
    {
        return $this->belongsToMany(
            Organization::class,
            'organization_to_organization',
            'organization_stating_id',
            'organization_stated_id'
        )->withPivot('type', 'conflict')->withTimestamps();
    }

    /**
     * Get the organizations that stated this organization. (That know/do not know/… this organization.)
     */
    public function statingOrganizations(): BelongsToMany
    {
        return $this->belongsToMany(
            Organization::class,
            'organization_to_organization',
            'organization_stated_id',
            'organization_stating_id'
        )->withPivot('type', 'conflict')->withTimestamps();
    }

    // //////////////////////// //
    // / ↑ NETWORK ANALYSIS ↑ / //
    // //////////////////////// //

    /**
     * get all distinct resource categories of the resources of this organization
     *
     * @return Collection<ResourceCategory>
     */
    private function getCategoriesOfResources(HasMany $resources): Collection
    {
        return $resources->select('resource_categories.*')
            ->join('resource_to_category', 'resources.id', '=', 'resource_to_category.resource_id')
            ->join('resource_categories', 'resource_to_category.resource_category_id', '=', 'resource_categories.id')
            ->distinct()->get();
    }
}
