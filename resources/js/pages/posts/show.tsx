import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Post, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { ArrowLeft, Calendar, Edit, Trash2, User } from 'lucide-react';
import { useState } from 'react';

interface Props {
    post: { data: Post };
}

export default function PostShow({ post: { data: post } }: Props) {
    const { auth } = usePage<SharedData>().props;
    const isAuthor = auth?.user?.id === post.author.id;
    const [deleting, setDeleting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Posts', href: '/posts' },
        { title: post.title, href: `/posts/${post.id}` },
    ];

    function handleDelete() {
        setDeleting(true);
        router.delete(`/posts/${post.id}`, {
            onFinish: () => setDeleting(false),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={post.title} />
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Back link */}
                <Link
                    href="/posts"
                    className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-xs font-mono transition-colors"
                >
                    <ArrowLeft className="size-3" />
                    back to posts
                </Link>

                {/* Article header */}
                <header className="flex flex-col gap-4 border-b pb-6">
                    <h1 className="text-3xl font-semibold tracking-tight leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <div className="text-muted-foreground flex items-center gap-1.5 text-sm font-mono">
                            <User className="size-3.5" />
                            {post.author.name}
                        </div>
                        {post.published_at && (
                            <div className="text-muted-foreground flex items-center gap-1.5 text-sm font-mono">
                                <Calendar className="size-3.5" />
                                {new Date(post.published_at).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </div>
                        )}
                        <Badge variant="secondary" className="font-mono text-xs">
                            published
                        </Badge>
                    </div>

                    {/* Author actions */}
                    {isAuthor && (
                        <div className="flex items-center gap-2 pt-1">
                            <Link href={`/posts/${post.id}/edit`}>
                                <Button variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
                                    <Edit className="size-3" />
                                    Edit
                                </Button>
                            </Link>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1.5 font-mono text-xs text-destructive hover:bg-destructive hover:text-white">
                                        <Trash2 className="size-3" />
                                        Delete
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Post</DialogTitle>
                                        <DialogDescription>
                                            Are you sure you want to delete "{post.title}"? This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" size="sm">Cancel</Button>
                                        </DialogClose>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleDelete}
                                            disabled={deleting}
                                        >
                                            {deleting ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </header>

                {/* Article body */}
                <article className="prose prose-neutral dark:prose-invert max-w-none">
                    <div className="text-foreground whitespace-pre-wrap leading-relaxed text-base">
                        {post.content}
                    </div>
                </article>
            </div>
        </AppLayout>
    );
}
