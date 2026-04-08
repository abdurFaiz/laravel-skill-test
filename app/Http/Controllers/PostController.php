<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Support\Facades\Gate;

class PostController extends Controller
{
    // 4-1: Public paginated published posts — JSON response
    public function index()
    {
        $posts = Post::published()
            ->with('user')
            ->latest('published_at')
            ->paginate(20);

        return PostResource::collection($posts);
    }

    // 4-2: Auth only — return view name string
    public function create()
    {
        return 'posts.create';
    }

    // 4-3: Auth only, validated — 201 Created with resource
    public function store(StorePostRequest $request)
    {
        $post = $request->user()->posts()->create($request->validated());

        return (new PostResource($post->load('user')))
            ->response()
            ->setStatusCode(201);
    }

    // 4-4: Single active post — JSON response, 404 if draft/scheduled
    public function show(Post $post)
    {
        abort_if(!$post->isPublished(), 404);

        return new PostResource($post->load('user'));
    }

    // 4-5: Author only — return view name string
    public function edit(Post $post)
    {
        Gate::authorize('update', $post);

        return 'posts.edit';
    }

    // 4-6: Author only, validated — return updated resource
    public function update(UpdatePostRequest $request, Post $post)
    {
        $post->update($request->validated());

        return new PostResource($post->load('user'));
    }

    // 4-7: Author only — 204 No Content
    public function destroy(Post $post)
    {
        Gate::authorize('delete', $post);

        $post->delete();

        return response()->noContent();
    }
}