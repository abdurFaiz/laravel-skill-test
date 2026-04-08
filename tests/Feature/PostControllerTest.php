<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostControllerTest extends TestCase
{
    use RefreshDatabase;

    // =========================================================================
    // 4-1: posts.index
    // =========================================================================

    public function test_index_returns_paginated_published_posts(): void
    {
        $user = User::factory()->create();

        // Create 25 published posts
        Post::factory()->count(25)->create([
            'user_id' => $user->id,
            'is_draft' => false,
            'published_at' => now()->subDay(),
        ]);

        $response = $this->get('/posts');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('posts/index')
            ->has('posts.data', 20) // 20 per page
        );
    }

    public function test_index_excludes_draft_posts(): void
    {
        $user = User::factory()->create();

        Post::factory()->create([
            'user_id' => $user->id,
            'is_draft' => true,
            'published_at' => null,
        ]);

        Post::factory()->create([
            'user_id' => $user->id,
            'is_draft' => false,
            'published_at' => now()->subDay(),
        ]);

        $response = $this->get('/posts');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('posts.data', 1)
        );
    }

    public function test_index_excludes_scheduled_posts(): void
    {
        $user = User::factory()->create();

        // Scheduled post (future published_at)
        Post::factory()->create([
            'user_id' => $user->id,
            'is_draft' => false,
            'published_at' => now()->addDays(3),
        ]);

        // Published post
        Post::factory()->create([
            'user_id' => $user->id,
            'is_draft' => false,
            'published_at' => now()->subDay(),
        ]);

        $response = $this->get('/posts');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('posts.data', 1)
        );
    }

    public function test_index_includes_author_data(): void
    {
        $user = User::factory()->create(['name' => 'John Doe']);

        Post::factory()->create([
            'user_id' => $user->id,
            'is_draft' => false,
            'published_at' => now()->subDay(),
        ]);

        $response = $this->get('/posts');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('posts.data.0.author', fn ($author) => $author
                ->where('name', 'John Doe')
                ->where('id', $user->id)
            )
        );
    }

    // =========================================================================
    // 4-2: posts.create
    // =========================================================================

    public function test_create_requires_authentication(): void
    {
        $response = $this->get('/posts/create');

        $response->assertRedirect('/login');
    }

    public function test_create_returns_page_for_authenticated_user(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/posts/create');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('posts/create')
        );
    }

    // =========================================================================
    // 4-3: posts.store
    // =========================================================================

    public function test_store_requires_authentication(): void
    {
        $response = $this->post('/posts', [
            'title' => 'Test Post',
            'content' => 'Test content',
        ]);

        $response->assertRedirect('/login');
    }

    public function test_store_creates_post_with_valid_data(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/posts', [
            'title' => 'My New Post',
            'content' => 'This is the content of my post.',
            'published_at' => now()->toDateTimeString(),
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('posts', [
            'title' => 'My New Post',
            'content' => 'This is the content of my post.',
            'user_id' => $user->id,
        ]);
    }

    public function test_store_validates_required_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/posts', []);

        $response->assertSessionHasErrors(['title', 'content']);
    }

    public function test_store_assigns_authenticated_user_as_author(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/posts', [
            'title' => 'Authored Post',
            'content' => 'Content here.',
        ]);

        $this->assertDatabaseHas('posts', [
            'title' => 'Authored Post',
            'user_id' => $user->id,
        ]);
    }

    // =========================================================================
    // 4-4: posts.show
    // =========================================================================

    public function test_show_returns_published_post(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
            'is_draft' => false,
            'published_at' => now()->subDay(),
        ]);

        $response = $this->get("/posts/{$post->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('posts/show')
            ->has('post.data', fn ($data) => $data
                ->where('id', $post->id)
                ->where('title', $post->title)
                ->etc()
            )
        );
    }

    public function test_show_returns_404_for_draft_post(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
            'is_draft' => true,
            'published_at' => null,
        ]);

        $response = $this->get("/posts/{$post->id}");

        $response->assertNotFound();
    }

    public function test_show_returns_404_for_scheduled_post(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create([
            'user_id' => $user->id,
            'is_draft' => false,
            'published_at' => now()->addDays(5),
        ]);

        $response = $this->get("/posts/{$post->id}");

        $response->assertNotFound();
    }

    // =========================================================================
    // 4-5: posts.edit
    // =========================================================================

    public function test_edit_requires_authentication(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->get("/posts/{$post->id}/edit");

        $response->assertRedirect('/login');
    }

    public function test_edit_returns_page_for_author(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get("/posts/{$post->id}/edit");

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('posts/edit')
        );
    }

    public function test_edit_forbidden_for_non_author(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $author->id]);

        $response = $this->actingAs($otherUser)->get("/posts/{$post->id}/edit");

        $response->assertForbidden();
    }

    // =========================================================================
    // 4-6: posts.update
    // =========================================================================

    public function test_update_requires_authentication(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->put("/posts/{$post->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertRedirect('/login');
    }

    public function test_update_allowed_for_author(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->put("/posts/{$post->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_update_forbidden_for_non_author(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $author->id]);

        $response = $this->actingAs($otherUser)->put("/posts/{$post->id}", [
            'title' => 'Hijacked Title',
        ]);

        $response->assertForbidden();
    }

    public function test_update_validates_data(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->put("/posts/{$post->id}", [
            'title' => '', // required when present
        ]);

        $response->assertSessionHasErrors(['title']);
    }

    // =========================================================================
    // 4-7: posts.destroy
    // =========================================================================

    public function test_destroy_requires_authentication(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->delete("/posts/{$post->id}");

        $response->assertRedirect('/login');
    }

    public function test_destroy_allowed_for_author(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->delete("/posts/{$post->id}");

        $response->assertRedirect('/posts');
        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }

    public function test_destroy_forbidden_for_non_author(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $author->id]);

        $response = $this->actingAs($otherUser)->delete("/posts/{$post->id}");

        $response->assertForbidden();
        $this->assertDatabaseHas('posts', ['id' => $post->id]);
    }
}
