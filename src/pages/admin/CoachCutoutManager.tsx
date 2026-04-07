import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface Coach {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  cutout_url: string | null;
  status: string | null;
}

export default function CoachCutoutManager() {
  const queryClient = useQueryClient();
  const [processingCoaches, setProcessingCoaches] = useState<Set<string>>(new Set());
  const [previewBackground, setPreviewBackground] = useState<"black" | "white" | "checker">("black");

  const { data: coaches, isLoading } = useQuery({
    queryKey: ["admin-coaches-cutouts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("id, display_name, avatar_url, cutout_url, status")
        .order("display_name");

      if (error) throw error;
      return data as Coach[];
    },
  });

  // Convert image URL to base64 for local images
  const imageToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const regenerateCutout = async (coach: Coach) => {
    if (!coach.avatar_url) {
      toast.error(`${coach.display_name || "Coach"} has no avatar image to process`);
      return;
    }

    setProcessingCoaches((prev) => new Set(prev).add(coach.id));

    try {
      console.log("Regenerating cutout for:", coach.display_name);
      
      // Determine if we need to convert to base64
      const isLocalImage = coach.avatar_url.startsWith("/");
      let requestBody: { coachId: string; imageUrl?: string; imageBase64?: string };
      
      if (isLocalImage) {
        // Convert local image to base64
        const base64 = await imageToBase64(coach.avatar_url);
        requestBody = {
          imageBase64: base64,
          coachId: coach.id,
        };
      } else {
        // Use full URL directly
        requestBody = {
          imageUrl: coach.avatar_url,
          coachId: coach.id,
        };
      }
      
      const { data, error } = await supabase.functions.invoke("remove-background", {
        body: requestBody,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Cutout regenerated for ${coach.display_name}`);
      queryClient.invalidateQueries({ queryKey: ["admin-coaches-cutouts"] });
    } catch (error) {
      console.error("Error regenerating cutout:", error);
      toast.error(`Failed to regenerate cutout for ${coach.display_name}: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setProcessingCoaches((prev) => {
        const next = new Set(prev);
        next.delete(coach.id);
        return next;
      });
    }
  };

  const regenerateAllMutation = useMutation({
    mutationFn: async () => {
      const coachesWithAvatars = coaches?.filter((c) => c.avatar_url) || [];
      
      for (const coach of coachesWithAvatars) {
        await regenerateCutout(coach);
        // Small delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    },
    onSuccess: () => {
      toast.success("All cutouts regenerated!");
    },
    onError: (error) => {
      toast.error(`Batch regeneration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });

  const getBackgroundStyle = () => {
    switch (previewBackground) {
      case "white":
        return "bg-white";
      case "checker":
        return "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNoZWNrZXIiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZGRkIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNkZGQiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0id2hpdGUiLz48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9InVybCgjY2hlY2tlcikiLz48L3N2Zz4=')]";
      default:
        return "bg-black";
    }
  };

  const coachesWithAvatars = coaches?.filter((c) => c.avatar_url) || [];
  const isProcessingAny = processingCoaches.size > 0 || regenerateAllMutation.isPending;

  return (
    <AdminLayout>
      <div className="container py-12 max-w-7xl">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Coach Cutout Manager</h1>
              <p className="text-muted-foreground mt-1">
                Regenerate transparent background cutouts for coach photos
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => regenerateAllMutation.mutate()}
                disabled={isProcessingAny || coachesWithAvatars.length === 0}
                size="lg"
              >
                {regenerateAllMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate All ({coachesWithAvatars.length})
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview Background Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Preview background:</span>
            <div className="flex gap-1">
              {(["black", "white", "checker"] as const).map((bg) => (
                <Button
                  key={bg}
                  variant={previewBackground === bg ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewBackground(bg)}
                >
                  {bg.charAt(0).toUpperCase() + bg.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Coach Grid */}
          {!isLoading && coaches && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((coach) => {
                const isProcessing = processingCoaches.has(coach.id);
                const hasAvatar = !!coach.avatar_url;
                const hasCutout = !!coach.cutout_url;

                return (
                  <Card key={coach.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg truncate">
                          {coach.display_name || "Unnamed Coach"}
                        </CardTitle>
                        <Badge variant={coach.status === "approved" ? "default" : "secondary"}>
                          {coach.status || "pending"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Image Preview */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Avatar */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground text-center">Avatar</p>
                          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            {coach.avatar_url ? (
                              <img
                                src={coach.avatar_url}
                                alt={`${coach.display_name} avatar`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">No image</span>
                            )}
                          </div>
                        </div>

                        {/* Cutout */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground text-center">Cutout</p>
                          <div className={`aspect-[3/4] rounded-lg overflow-hidden flex items-center justify-center ${getBackgroundStyle()}`}>
                            {isProcessing ? (
                              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            ) : coach.cutout_url ? (
                              <img
                                src={`${coach.cutout_url}?t=${Date.now()}`}
                                alt={`${coach.display_name} cutout`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">No cutout</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Indicators */}
                      <div className="flex items-center gap-2 text-sm">
                        {hasAvatar ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" /> Avatar
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-destructive">
                            <XCircle className="w-4 h-4" /> No Avatar
                          </span>
                        )}
                        {hasCutout ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" /> Cutout
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600">
                            <AlertCircle className="w-4 h-4" /> No Cutout
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => regenerateCutout(coach)}
                        disabled={!hasAvatar || isProcessing}
                        className="w-full"
                        variant={hasCutout ? "outline" : "default"}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {hasCutout ? "Regenerate" : "Generate"} Cutout
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!coaches || coaches.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No coaches found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
