<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name'])]
class Category extends Model
{
    /**
     * Things assigned to this category.
     *
     * @return HasMany<Thing, $this>
     */
    public function things(): HasMany
    {
        return $this->hasMany(Thing::class);
    }
}
