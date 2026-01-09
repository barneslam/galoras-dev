import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, imageBase64, coachId } = await req.json();

    if ((!imageUrl && !imageBase64) || !coachId) {
      throw new Error("imageUrl or imageBase64, and coachId are required");
    }

    console.log("Processing background removal for coach:", coachId);

    // Use provided base64 or fetch the image
    let base64Data: string;
    
    if (imageBase64) {
      // Base64 data was provided directly
      console.log("Using provided base64 image data");
      base64Data = imageBase64;
    } else if (imageUrl.startsWith("data:")) {
      // Already a data URL
      base64Data = imageUrl;
    } else {
      // Fetch from URL - must be a full HTTP URL
      if (!imageUrl.startsWith("http")) {
        throw new Error("imageUrl must be a full HTTP(S) URL or use imageBase64 for local images");
      }
      
      console.log("Fetching image from:", imageUrl);
      
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }
      
      const imageBuffer = new Uint8Array(await imageResponse.arrayBuffer());
      // Avoid call stack overflow on large images
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < imageBuffer.length; i += chunkSize) {
        binary += String.fromCharCode(...imageBuffer.subarray(i, i + chunkSize));
      }
      const base64 = btoa(binary);
      const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
      base64Data = `data:${contentType};base64,${base64}`;
    }

    console.log("Image ready, sending to AI for background removal...");

    // Use Lovable AI to remove background with improved prompt
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Remove the background from this portrait photo completely. Create a PNG with TRUE TRANSPARENCY (alpha channel).

CRITICAL REQUIREMENTS:
1. The background MUST be completely transparent (alpha = 0), NOT black, NOT white, NOT any solid color
2. Keep only the person with clean, anti-aliased edges
3. Preserve natural shadows only if they are part of the subject
4. Output format: PNG with alpha transparency channel

After removing the background:
1. Crop tightly to the subject with about 10% padding around all edges
2. Scale the result to approximately 600x800 pixels (3:4 aspect ratio)
3. Center the subject horizontally
4. Align the subject to the bottom of the frame (head near top, body fills frame)

The output MUST have a fully transparent background - this is essential for compositing over colored backgrounds.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Data,
                },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

    const cutoutBase64 = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!cutoutBase64) {
      console.error("No image in AI response:", JSON.stringify(aiData));
      throw new Error("No image returned from AI");
    }

    // Upload the cutout to Supabase Storage
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Convert base64 to blob
    const base64Content = cutoutBase64.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Content), (c) => c.charCodeAt(0));

    const fileName = `cutouts/${coachId}-cutout.png`;

    const { error: uploadError } = await supabase.storage
      .from("coach-avatars")
      .upload(fileName, binaryData, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Failed to upload cutout: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("coach-avatars")
      .getPublicUrl(fileName);

    const cutoutUrl = publicUrlData.publicUrl;
    console.log("Cutout uploaded to:", cutoutUrl);

    // Update coach record
    const { error: updateError } = await supabase
      .from("coaches")
      .update({ cutout_url: cutoutUrl })
      .eq("id", coachId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Failed to update coach: ${updateError.message}`);
    }

    console.log("Coach record updated successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        cutoutUrl,
        message: "Background removed successfully" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
