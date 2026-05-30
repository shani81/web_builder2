'use client';

import { useState } from 'react';
import { Loader2, Send, Sparkles, Wand2, X } from 'lucide-react';
import type { SEOAnalysis } from '@buildr/types';
import { useEditorStore } from '@/stores/editor.store';
import { analyzeSeo, chat, improveContent } from '@/lib/ai';
import { ApiClientError } from '@/lib/api-client';
import { str } from '@/components/blocks/types';
import { Button } from '@/components/ui/button';
import { MediaPicker } from '@/components/media/media-picker';

type Msg = { role: 'user' | 'assistant'; content: string };
const TEXT_KEYS = ['content', 'headline', 'subtext', 'heading', 'text'];

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.code === 'AI_DISABLED'
      ? 'AI is disabled. Set ANTHROPIC_API_KEY on the API server to enable it.'
      : error.message;
  }
  return 'Something went wrong.';
}

export function AIDrawer() {
  const isOpen = useEditorStore((s) => s.isAIPanelOpen);
  const toggle = useEditorStore((s) => s.toggleAIPanel);
  const site = useEditorStore((s) => s.site);
  const page = useEditorStore((s) => s.activePage);
  const selectedId = useEditorStore((s) => s.selectedBlockId);
  const applyAiAction = useEditorStore((s) => s.applyAiAction);
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps);

  const [tab, setTab] = useState<'chat' | 'seo'>('chat');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seo, setSeo] = useState<SEOAnalysis | null>(null);
  const [imageQuery, setImageQuery] = useState<string | null>(null);

  if (!isOpen || !site || !page) return null;

  const send = async () => {
    const message = input.trim();
    if (!message || busy) return;
    setError(null);
    setInput('');
    const history = messages.slice(-10);
    setMessages((m) => [
      ...m,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
    setBusy(true);
    try {
      await chat(
        { message, context: { siteId: site.id, pageId: page.id }, history },
        (event) => {
          if (event.type === 'delta') {
            setMessages((m) => {
              const next = [...m];
              const last = next[next.length - 1]!;
              next[next.length - 1] = {
                ...last,
                content: last.content + event.text,
              };
              return next;
            });
          } else if (event.type === 'action') {
            if ((event.action.type as string) === 'findImages') {
              const q = str(event.action.payload?.query);
              setImageQuery(q || 'photo');
              setMessages((m) => [
                ...m,
                { role: 'assistant', content: '🔎 Opening stock photos…' },
              ]);
            } else {
              applyAiAction(event.action);
              setMessages((m) => [
                ...m,
                {
                  role: 'assistant',
                  content: `✓ ${event.action.description || 'Applied a change.'}`,
                },
              ]);
            }
          }
        },
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const improveSelected = async () => {
    if (!selectedId || busy) return;
    const block = page.blocks.find((b) => b.id === selectedId);
    if (!block) return;
    const key = TEXT_KEYS.find((k) => str(block.props[k]).length > 0);
    if (!key) {
      setError('Select a block with text to improve.');
      return;
    }
    setError(null);
    setBusy(true);
    let acc = '';
    try {
      await improveContent(
        {
          content: str(block.props[key]),
          instruction:
            'Make this more compelling, clear, and professional. Keep it concise. Return only the text.',
        },
        (event) => {
          acc += event.text;
          updateBlockProps(selectedId, { [key]: acc });
        },
      );
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const runSeo = async () => {
    setError(null);
    setBusy(true);
    setSeo(null);
    try {
      setSeo(await analyzeSeo({ siteId: site.id, pageId: page.id }));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
    <aside className="flex w-[360px] shrink-0 flex-col border-l border-black/10 bg-white">
      <header className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <span className="flex items-center gap-2 font-semibold">
          <Sparkles className="size-4 text-[var(--color-brand)]" aria-hidden />
          AI Assistant
        </span>
        <button
          type="button"
          aria-label="Close AI panel"
          onClick={() => toggle(false)}
          className="grid size-8 place-items-center rounded-lg text-black/50 hover:bg-black/5"
        >
          <X className="size-4" aria-hidden />
        </button>
      </header>

      <div className="flex gap-1 border-b border-black/10 px-3 py-2 text-sm">
        {(['chat', 'seo'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 capitalize ${
              tab === t ? 'bg-black/5 font-medium' : 'text-black/50'
            }`}
          >
            {t === 'seo' ? 'SEO' : 'Chat'}
          </button>
        ))}
      </div>

      {error ? (
        <p className="m-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {tab === 'chat' ? (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.length === 0 ? (
              <p className="text-black/40">
                Ask me to change the page — e.g. &ldquo;add a pricing-style CTA&rdquo;
                or &ldquo;make the hero headline punchier&rdquo;.
              </p>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === 'user'
                      ? 'ml-auto max-w-[85%] rounded-2xl bg-[var(--color-brand)] px-3 py-2 text-white'
                      : 'max-w-[85%] whitespace-pre-wrap rounded-2xl bg-black/5 px-3 py-2'
                  }
                >
                  {m.content || (busy ? '…' : '')}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-black/10 p-3">
            <Button
              variant="outline"
              size="sm"
              className="mb-2 w-full"
              disabled={busy || !selectedId}
              onClick={improveSelected}
            >
              <Wand2 className="size-4" aria-hidden />
              Improve selected text
            </Button>
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={2}
                placeholder="Ask the assistant…"
                className="flex-1 resize-none rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)]"
              />
              <Button size="sm" disabled={busy} onClick={() => void send()}>
                {busy ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="size-4" aria-hidden />
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 text-sm">
          <Button disabled={busy} onClick={runSeo} className="w-full">
            {busy ? 'Analyzing…' : 'Analyze this page'}
          </Button>
          {seo ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-[var(--color-brand)]">
                  {seo.score}
                </span>
                <span className="text-black/50">/ 100 SEO score</span>
              </div>
              {seo.suggestedMetaTitle ? (
                <div>
                  <p className="font-medium">Suggested title</p>
                  <p className="text-black/60">{seo.suggestedMetaTitle}</p>
                </div>
              ) : null}
              {seo.suggestedMetaDescription ? (
                <div>
                  <p className="font-medium">Suggested description</p>
                  <p className="text-black/60">{seo.suggestedMetaDescription}</p>
                </div>
              ) : null}
              <ul className="space-y-2">
                {seo.issues.map((issue, i) => (
                  <li key={i} className="rounded-lg border border-black/10 p-3">
                    <span className="text-xs font-semibold uppercase text-black/40">
                      {issue.severity}
                    </span>
                    <p className="font-medium">{issue.message}</p>
                    <p className="text-black/60">{issue.suggestion}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </aside>

    {imageQuery !== null ? (
      <MediaPicker
        key={imageQuery}
        open
        initialTab="stock"
        initialQuery={imageQuery}
        onClose={() => setImageQuery(null)}
        onSelect={(image) => {
          const s = useEditorStore.getState();
          const sel = s.activePage?.blocks.find(
            (b) => b.id === s.selectedBlockId,
          );
          const props = {
            src: image.url,
            ...(image.alt ? { alt: image.alt } : {}),
          };
          if (sel?.type === 'image') {
            s.updateBlockProps(sel.id, props);
          } else {
            s.addBlock('image');
            const newId = useEditorStore.getState().selectedBlockId;
            if (newId) useEditorStore.getState().updateBlockProps(newId, props);
          }
          setImageQuery(null);
        }}
      />
    ) : null}
    </>
  );
}
