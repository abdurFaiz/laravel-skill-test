<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class Post extends Model
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;

    protected $fillable = ['title', 'content', 'is_draft', 'published_at', 'user_id'];

    protected $casts = [
        'published_at' => 'datetime',
        'is_draft' => 'boolean',
    ];

    // Relationship
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Only published posts (not draft, published_at is in the past)
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_draft', false)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', Carbon::now());
    }

    // Check if the post is currently active (published)
    public function isPublished(): bool
    {
        return !$this->is_draft
            && !is_null($this->published_at)
            && $this->published_at->isPast();
    }
}
