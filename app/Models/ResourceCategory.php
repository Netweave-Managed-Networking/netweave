<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ResourceCategory extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'resource_categories';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'definition',
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

    /** the resources that belong to the resource category */
    public function resources(): BelongsToMany
    {
        return $this->belongsToMany(Resource::class, 'resource_to_category')->where('type', 'resource');
    }

    /** the requirements that belong to the resource category */
    public function requirements(): BelongsToMany
    {
        return $this->belongsToMany(Resource::class, 'resource_to_category')->where('type', 'requirement');
    }

    /** get all distinct organizations which NEED at least one resource of this resource category */
    public function getRequiringOrganizations(): Collection
    {
        return $this->requirements()->select('organizations.*')
            ->join('organizations', 'resources.organization_id', '=', 'organizations.id')
            ->distinct()->get();
    }

    /** get all distinct organizations which HAVE at least one resource of this resource category */
    public function getProvidingOrganizations(): Collection
    {
        return $this->resources()->select('organizations.*')
            ->join('organizations', 'resources.organization_id', '=', 'organizations.id')
            ->distinct()->get();
    }
}
