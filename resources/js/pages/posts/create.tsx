import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Posts', href: '/posts' },
    { title: 'Create', href: '/posts/create' },
];

type PostForm = {
    title: string;
    content: string;
    is_draft: boolean;
    published_at: string;
};

export default function PostCreate() {
    const { data, setData, post, processing, errors } = useForm<PostForm>({
        title: '',
        content: '',
        is_draft: false,
        published_at: new Date().toISOString().slice(0, 16),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/posts');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Post" />
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* Back link */}
                <Link
                    href="/posts"
                    className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-xs font-mono transition-colors"
                >
                    <ArrowLeft className="size-3" />
                    back to posts
                </Link>

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Create Post</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-mono">
                        compose a new post entry
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* Title */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="title" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Enter post title..."
                            className="text-lg font-medium"
                            autoFocus
                        />
                        {errors.title && (
                            <p className="text-destructive text-xs font-mono">{errors.title}</p>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="content" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            Content
                        </Label>
                        <textarea
                            id="content"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            placeholder="Write your content here..."
                            rows={12}
                            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex w-full rounded-md border bg-transparent px-3 py-2 text-sm leading-relaxed shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] resize-y"
                        />
                        {errors.content && (
                            <p className="text-destructive text-xs font-mono">{errors.content}</p>
                        )}
                    </div>

                    {/* Published At */}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="published_at" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                            Publish Date
                        </Label>
                        <Input
                            id="published_at"
                            type="datetime-local"
                            value={data.published_at}
                            onChange={(e) => setData('published_at', e.target.value)}
                            className="w-fit font-mono text-sm"
                        />
                        <p className="text-muted-foreground text-xs font-mono">
                            Set a future date to schedule, or leave as now to publish immediately.
                        </p>
                        {errors.published_at && (
                            <p className="text-destructive text-xs font-mono">{errors.published_at}</p>
                        )}
                    </div>

                    {/* Draft toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={data.is_draft}
                            onClick={() => setData('is_draft', !data.is_draft)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ${
                                data.is_draft
                                    ? 'bg-primary border-primary'
                                    : 'bg-muted border-input'
                            }`}
                        >
                            <span
                                className={`pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                                    data.is_draft ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            />
                        </button>
                        <Label className="font-mono text-xs text-muted-foreground cursor-pointer" onClick={() => setData('is_draft', !data.is_draft)}>
                            Save as draft
                        </Label>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 border-t pt-6">
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Send className="size-3.5" />
                            {processing ? 'Publishing...' : data.is_draft ? 'Save Draft' : 'Publish'}
                        </Button>
                        <Link href="/posts">
                            <Button type="button" variant="ghost" className="font-mono text-xs">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
