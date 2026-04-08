import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData, type Post } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, User, Calendar, ArrowRight } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Posts', href: '/posts' },
];

interface Props {
    posts: PaginatedData<Post>;
}

export default function PostsIndex({ posts }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Posts" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
                        <p className="text-muted-foreground mt-1 text-sm font-mono">
                            {posts.meta.total} published {posts.meta.total === 1 ? 'entry' : 'entries'}
                        </p>
                    </div>
                    <Link href="/posts/create">
                        <Button size="sm" className="gap-2">
                            <Plus className="size-4" />
                            <span className="hidden sm:inline">New Post</span>
                        </Button>
                    </Link>
                </div>

                {/* Post List */}
                {posts.data.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-12">
                        <div className="bg-muted flex size-12 items-center justify-center rounded-lg">
                            <Plus className="text-muted-foreground size-6" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium">No posts yet</p>
                            <p className="text-muted-foreground mt-1 text-sm font-mono">Create your first post to get started.</p>
                        </div>
                        <Link href="/posts/create">
                            <Button variant="outline" size="sm">Create Post</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {posts.data.map((post, index) => (
                            <Link
                                key={post.id}
                                href={`/posts/${post.id}`}
                                className="group relative flex flex-col gap-3 rounded-lg border bg-card p-4 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm sm:flex-row sm:items-start sm:justify-between"
                            >
                                {/* Left content */}
                                <div className="flex min-w-0 flex-1 flex-col gap-2">
                                    <div className="flex items-start gap-3">
                                        <span className="text-muted-foreground/40 mt-0.5 font-mono text-xs tabular-nums">
                                            {String(((posts.meta.current_page - 1) * posts.meta.per_page) + index + 1).padStart(2, '0')}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="truncate font-medium leading-tight group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h2>
                                            <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed">
                                                {post.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right metadata */}
                                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-mono">
                                        <User className="size-3" />
                                        {post.author.name}
                                    </div>
                                    {post.published_at && (
                                        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-mono">
                                            <Calendar className="size-3" />
                                            {new Date(post.published_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Arrow indicator */}
                                <ArrowRight className="text-muted-foreground/0 group-hover:text-muted-foreground absolute right-4 top-1/2 hidden size-4 -translate-y-1/2 transition-all duration-200 sm:block" />
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {posts.meta.last_page > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                        <p className="text-muted-foreground text-xs font-mono">
                            Page {posts.meta.current_page} of {posts.meta.last_page}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                disabled={!posts.links.prev}
                                onClick={() => posts.links.prev && router.visit(posts.links.prev)}
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            {posts.meta.links
                                .filter(link => !link.label.includes('Previous') && !link.label.includes('Next'))
                                .map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'ghost'}
                                        size="icon"
                                        className="size-8 font-mono text-xs"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                    >
                                        {link.label}
                                    </Button>
                                ))}
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                disabled={!posts.links.next}
                                onClick={() => posts.links.next && router.visit(posts.links.next)}
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
