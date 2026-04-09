import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProductTypes } from '@/hooks/useProductTypes';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Package,
  Clock,
  DollarSign,
} from 'lucide-react';

/* ---------- types ---------- */

interface CoachProduct {
  id: string;
  coach_id: string;
  product_type: string;
  title: string;
  summary?: string | null;
  outcome_statement?: string | null;
  target_audience?: string[] | null;
  delivery_format?: string | null;
  duration_minutes?: number | null;
  format?: string | null;
  price_type: string;
  price_amount?: number | null;
  price_range_min?: number | null;
  price_range_max?: number | null;
  booking_mode: string;
  is_active: boolean;
  sort_order: number;
}

interface ProductDraft {
  title: string;
  product_type: string;
  summary: string;
  outcome_statement: string;
  target_audience: string;
  duration_minutes: number | '';
  format: string;
  delivery_format: string;
  price_type: string;
  price_amount: number | '';
  price_range_min: number | '';
  price_range_max: number | '';
  booking_mode: string;
  is_active: boolean;
}

const EMPTY_DRAFT: ProductDraft = {
  title: '',
  product_type: 'diagnostic',
  summary: '',
  outcome_statement: '',
  target_audience: '',
  duration_minutes: '',
  format: 'online',
  delivery_format: '',
  price_type: 'fixed',
  price_amount: '',
  price_range_min: '',
  price_range_max: '',
  booking_mode: 'enquiry',
  is_active: true,
};

interface CoachProductsManagerProps {
  coachProfile: { id: string; display_name: string | null };
}

/* ---------- helpers ---------- */

const priceDisplay = (p: CoachProduct) => {
  if (p.price_type === 'fixed' && p.price_amount)
    return `$${(p.price_amount / 100).toLocaleString()}`;
  if (p.price_type === 'range' && p.price_range_min && p.price_range_max)
    return `$${(p.price_range_min / 100).toLocaleString()} - $${(p.price_range_max / 100).toLocaleString()}`;
  return 'Enquiry';
};

/* ---------- component ---------- */

export function CoachProductsManager({ coachProfile }: CoachProductsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { types, getConfig } = useProductTypes();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(EMPTY_DRAFT);

  /* --- query --- */

  const { data: products = [], isLoading } = useQuery<CoachProduct[]>({
    queryKey: ['coach-own-products', coachProfile.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('coach_products')
        .select('*')
        .eq('coach_id', coachProfile.id)
        .order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
  });

  /* --- mutations --- */

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { error } = await (supabase as any)
        .from('coach_products')
        .upsert(payload, { onConflict: 'id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-own-products', coachProfile.id] });
      toast({ title: 'Product saved' });
      closeForm();
    },
    onError: (err: Error) => {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('coach_products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-own-products', coachProfile.id] });
      toast({ title: 'Product deleted' });
    },
    onError: (err: Error) => {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase as any)
        .from('coach_products')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { is_active }) => {
      queryClient.invalidateQueries({ queryKey: ['coach-own-products', coachProfile.id] });
      toast({ title: is_active ? 'Product activated' : 'Product deactivated' });
    },
    onError: (err: Error) => {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    },
  });

  /* --- form helpers --- */

  const openNew = () => {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: CoachProduct) => {
    setDraft({
      title: p.title,
      product_type: p.product_type,
      summary: (p as any).summary ?? '',
      outcome_statement: p.outcome_statement ?? '',
      target_audience: Array.isArray(p.target_audience) ? p.target_audience.join(', ') : '',
      duration_minutes: p.duration_minutes ?? '',
      format: p.format ?? p.delivery_format ?? 'online',
      delivery_format: p.delivery_format ?? '',
      price_type: p.price_type,
      price_amount: p.price_amount ?? '',
      price_range_min: p.price_range_min ?? '',
      price_range_max: p.price_range_max ?? '',
      booking_mode: p.booking_mode,
      is_active: p.is_active,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  };

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    if (!draft.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    const audience = draft.target_audience
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Record<string, unknown> = {
      product_type: draft.product_type,
      title: draft.title.trim(),
      summary: draft.summary || null,
      outcome_statement: draft.outcome_statement || null,
      target_audience: audience.length > 0 ? audience : null,
      duration_minutes: draft.duration_minutes || null,
      format: draft.format,
      delivery_format: draft.delivery_format || draft.format,
      price_type: draft.price_type,
      price_amount: draft.price_type === 'fixed' ? (draft.price_amount || null) : null,
      price_range_min: draft.price_type === 'range' ? (draft.price_range_min || null) : null,
      price_range_max: draft.price_type === 'range' ? (draft.price_range_max || null) : null,
      booking_mode: draft.booking_mode,
      is_active: draft.is_active,
    };

    if (editingId) {
      payload.id = editingId;
    } else {
      payload.coach_id = coachProfile.id;
      payload.sort_order = products.length;
    }

    saveMutation.mutate(payload);
  };

  const handleDelete = (p: CoachProduct) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    deleteMutation.mutate(p.id);
  };

  /* --- loading state --- */

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  /* --- form view --- */

  if (showForm) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-white">
            {editingId ? 'Edit Product' : 'New Product'}
          </h2>
          <Button variant="ghost" size="sm" onClick={closeForm}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-white">Title</Label>
              <Input
                value={draft.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. 90-Day Leadership Sprint"
                className="bg-background border-border"
              />
            </div>

            {/* Product Type */}
            <div className="space-y-1.5">
              <Label className="text-white">Product Type</Label>
              <select
                value={draft.product_type}
                onChange={(e) => set('product_type', e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {types.length > 0 ? (
                  types.map((t) => (
                    <option key={t.id} value={t.slug}>{t.label}</option>
                  ))
                ) : (
                  <>
                    <option value="diagnostic">Diagnostic</option>
                    <option value="block">Block</option>
                    <option value="program">Program</option>
                    <option value="enterprise">Enterprise</option>
                  </>
                )}
              </select>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <Label className="text-white">Summary / Description</Label>
              <textarea
                value={draft.summary}
                onChange={(e) => set('summary', e.target.value)}
                placeholder="Brief description of this product..."
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Outcome + Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white">Outcome Statement</Label>
                <Input
                  value={draft.outcome_statement}
                  onChange={(e) => set('outcome_statement', e.target.value)}
                  placeholder="What will the client achieve?"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white">Target Audience</Label>
                <Input
                  value={draft.target_audience}
                  onChange={(e) => set('target_audience', e.target.value)}
                  placeholder="e.g. Mid-level managers, VPs"
                  className="bg-background border-border"
                />
              </div>
            </div>

            {/* Duration + Format */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white">Duration (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  value={draft.duration_minutes}
                  onChange={(e) => set('duration_minutes', e.target.value ? Number(e.target.value) : '')}
                  placeholder="60"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white">Format</Label>
                <select
                  value={draft.format}
                  onChange={(e) => set('format', e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="online">Online</option>
                  <option value="in_person">In-Person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white">Delivery Format</Label>
                <Input
                  value={draft.delivery_format}
                  onChange={(e) => set('delivery_format', e.target.value)}
                  placeholder="e.g. 1:1, Group, Workshop"
                  className="bg-background border-border"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <Label className="text-white">Pricing</Label>
              <div className="flex gap-4">
                {(['fixed', 'range', 'enquiry'] as const).map((pt) => (
                  <label key={pt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price_type"
                      checked={draft.price_type === pt}
                      onChange={() => set('price_type', pt)}
                      className="accent-[hsl(var(--primary))]"
                    />
                    <span className="text-sm text-muted-foreground capitalize">{pt}</span>
                  </label>
                ))}
              </div>

              {draft.price_type === 'fixed' && (
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs">Amount (cents, e.g. 50000 = $500)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={draft.price_amount}
                    onChange={(e) => set('price_amount', e.target.value ? Number(e.target.value) : '')}
                    placeholder="50000"
                    className="bg-background border-border"
                  />
                </div>
              )}

              {draft.price_type === 'range' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">Min (cents)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.price_range_min}
                      onChange={(e) => set('price_range_min', e.target.value ? Number(e.target.value) : '')}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs">Max (cents)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.price_range_max}
                      onChange={(e) => set('price_range_max', e.target.value ? Number(e.target.value) : '')}
                      className="bg-background border-border"
                    />
                  </div>
                </div>
              )}

              {draft.price_type === 'enquiry' && (
                <p className="text-sm text-muted-foreground italic">
                  Clients will enquire directly via your booking link.
                </p>
              )}
            </div>

            {/* Booking Mode */}
            <div className="space-y-1.5">
              <Label className="text-white">Booking Mode</Label>
              <select
                value={draft.booking_mode}
                onChange={(e) => set('booking_mode', e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="stripe">Stripe Checkout</option>
                <option value="enquiry">Enquiry</option>
                <option value="external">External Link</option>
              </select>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3">
              <Switch
                checked={draft.is_active}
                onCheckedChange={(checked) => set('is_active', checked)}
              />
              <Label className="text-white">Active</Label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
              </Button>
              <Button variant="outline" onClick={closeForm} className="border-border text-muted-foreground">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* --- list view --- */

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-white">Products</h2>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">No products yet</p>
            <p className="text-sm text-muted-foreground/60 mb-6">
              Create your first coaching product to start accepting bookings.
            </p>
            <Button onClick={openNew} variant="outline" className="border-border gap-2">
              <Plus className="h-4 w-4" />
              Create your first product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => {
            const cfg = getConfig(p.product_type);
            return (
              <Card key={p.id} className="bg-card border-border group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`${cfg.className} text-xs`}>{cfg.label}</Badge>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={p.is_active}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({ id: p.id, is_active: checked })
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-white mb-1 truncate">
                    {p.title}
                  </h3>

                  {(p as any).summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {(p as any).summary}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {priceDisplay(p)}
                    </span>
                    {p.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {p.duration_minutes} min
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(p)}
                      className="border-border text-muted-foreground hover:text-white gap-1"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(p)}
                      disabled={deleteMutation.isPending}
                      className="border-border text-muted-foreground hover:text-red-400 hover:border-red-400/30 gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
