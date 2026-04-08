<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class PostController extends Controller
{
    // 4-1: Public paginated published posts
    public function index()
    {
        $posts = Post::published()
            ->with('user')
            ->latest('published_at')
            ->paginate(20);

        return Inertia::render('posts/index', [
            'posts' => PostResource::collection($posts),
        ]);
    }

    // 4-2: Auth only
    public function create()
    {
        return Inertia::render('posts/create');
    }

    // 4-3: Auth only, validated
    public function store(StorePostRequest $request)
    {
        $post = auth()->user()->posts()->create($request->validated());

        return redirect()->route('posts.show', $post)->with('success', 'Post created successfully.');
    }

    // 4-4: Single active post, 404 if draft/scheduled
    public function show(Post $post)
    {
        abort_if(!$post->isPublished(), 404);

        return Inertia::render('posts/show', [
            'post' => new PostResource($post->load('user')),
        ]);
    }

    // 4-5: Author only
    public function edit(Post $post)
    {
        Gate::authorize('update', $post);

        return Inertia::render('posts/edit', [
            'post' => new PostResource($post->load('user')),
        ]);
    }

    // 4-6: Author only, validated
    public function update(UpdatePostRequest $request, Post $post)
    {
        Gate::authorize('update', $post);

        $post->update($request->validated());

        return redirect()->route('posts.show', $post)->with('success', 'Post updated successfully.');
    }

    // 4-7: Author only
    public function destroy(Post $post)
    {
        Gate::authorize('delete', $post);

        $post->delete();

        return redirect()->route('posts.index')->with('success', 'Post deleted successfully.');
    }
}