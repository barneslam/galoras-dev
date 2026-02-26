import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, AlertCircle, Linkedin, Image, Calendar } from "lucide-react";
import {
  JOIN_REASON_OPTIONS,
  COMMITMENT_LEVEL_OPTIONS,
  START_TIMELINE_OPTIONS,
  PILLAR_SPECIALTIES,
  PRIMARY_PILLAR_OPTIONS,
  INDUSTRY_FOCUS_OPTIONS,
  COACHING_STYLE_OPTIONS,
  ENGAGEMENT_MODEL_OPTIONS,
  AVAILABILITY_STATUS_OPTIONS,
  FOUNDER_STAGE_OPTIONS,
  FOUNDER_FUNCTION_OPTIONS,
  EXEC_LEVEL_OPTIONS,
  EXEC_FUNCTION_OPTIONS,
  isFounderBackground,
  isExecutiveBackground,
} from "@/lib/coaching-constants";

interface CoachApplication {
  id: string;
  full_name: string;
  email: string;
  bio: string | null;
  specialties: string[] | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  coach_background: string | null;
  coach_background_detail: string | null;
  coaching_experience_years: string | null;
  coaching_experience_level: string | null;
  leadership_experience_years: string | null;
  current_role: string | null;
  coaching_philosophy: string | null;
}

export default function CoachOnboarding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token");

  const [state, setState] = useState<"loading" | "invalid" | "form" | "submitting" | "success">("loading");
  const [application, setApplication] = useState<CoachApplication | null>(null);

  // Read-only from Step 1
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");

  // Editable profile fields
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");

  // Step-2 fields
  const [pillarSpecialties, setPillarSpecialties] = useState<string[]>([]);
  const [primaryJoinReason, setPrimaryJoinReason] = useState("");
  const [commitmentLevel, setCommitmentLevel] = useState("");
  const [startTimeline, setStartTimeline] = useState("");
  const [excitementNote, setExcitementNote] = useState("");
  const [primaryPillar, setPrimaryPillar] = useState("");
  const [secondaryPillars, setSecondaryPillars] = useState<string[]>([]);
  const [industryFocus, setIndustryFocus] = useState<string[]>([]);
  const [coachingStyle, setCoachingStyle] = useState<string[]>([]);
  const [engagementModel, setEngagementModel] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("");
  const [founderStageFocus, setFounderStageFocus] = useState<string[]>([]);
  const [founderFunctionStrength, setFounderFunctionStrength] = useState<string[]>([]);
  const [execLevel, setExecLevel] = useState("");
  const [execFunction, setExecFunction] = useState<string[]>([]);

  const handlePillarChange = (specialty: string, checked: boolean) => {
    setPillarSpecialties(prev => checked ? [...prev, specialty] : prev.filter(s => s !== specialty));
  };

  const toggleArray = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string, checked: boolean) => {
    setter(prev => checked ? [...prev, value] : prev.filter(v => v !== value));
  };

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("validate-onboarding-token", { body: { token } });
      if (error || data?.error) { setState("invalid"); return; }
      const app = data.application;
      setApplication(app);
      setFullName(app.full_name || "");
      setBio(app.bio || "");
      setLinkedinUrl(app.linkedin_url || "");
      setAvatarUrl(app.avatar_url || "");
      setState("form");
    } catch {
      setState("invalid");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryPillar || !primaryJoinReason || !commitmentLevel || !startTimeline) {
      toast({ title: "Missing required fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setState("submitting");
    try {
      const coachBackground = application?.coach_background || "";
      const { data, error } = await supabase.functions.invoke("complete-onboarding", {
        body: {
          token,
          fullName: fullName.trim(),
          bio: bio.trim(),
          coachingFocus: pillarSpecialties.join(", "),
          linkedinUrl: linkedinUrl.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
          pillarSpecialties,
          primaryJoinReason,
          commitmentLevel,
          startTimeline,
          excitementNote: excitementNote.trim() || null,
          primaryPillar,
          secondaryPillars: secondaryPillars.length > 0 ? secondaryPillars : null,
          industryFocus: industryFocus.length > 0 ? industryFocus : null,
          coachingStyle: coachingStyle.length > 0 ? coachingStyle : null,
          engagementModel: engagementModel || null,
          availabilityStatus: availabilityStatus || null,
          founderStageFocus: isFounderBackground(coachBackground) && founderStageFocus.length > 0 ? founderStageFocus : null,
          founderFunctionStrength: isFounderBackground(coachBackground) && founderFunctionStrength.length > 0 ? founderFunctionStrength : null,
          execLevel: isExecutiveBackground(coachBackground) ? execLevel || null : null,
          execFunction: isExecutiveBackground(coachBackground) && execFunction.length > 0 ? execFunction : null,
          bookingUrl: bookingUrl.trim() || null,
        },
      });
      if (error || data?.error) throw new Error(data?.error || "Failed to complete onboarding");
      setState("success");
      toast({ title: "Profile completed!", description: "Your coach profile has been saved successfully." });
    } catch (error) {
      console.error("Submit error:", error);
      setState("form");
      toast({ title: "Submission failed", description: "Please try again or contact support.", variant: "destructive" });
    }
  };

  if (state === "loading") {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Validating your invitation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (state === "invalid") {
    return (
      <Layout>
        <section className="py-16">
          <div className="container-wide max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold mb-2">Invalid or Expired Link</h1>
                    <p className="text-muted-foreground">This onboarding link is no longer valid.</p>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/")}>Return to Home</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  if (state === "success") {
    return (
      <Layout>
        <section className="py-16">
          <div className="container-wide max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold mb-2">Welcome to Galoras!</h1>
                    <p className="text-muted-foreground">Your coach profile has been completed. You can now sign in to access your dashboard.</p>
                  </div>
                  <Button onClick={() => navigate("/login")}>Sign In</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  const coachBackground = application?.coach_background || "";

  return (
    <Layout>
      <section className="py-16">
        <div className="container-wide max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Complete Your Coach Profile</h1>
            <p className="text-muted-foreground mt-2">Step 2 of 2: Complete your coach profile (pillars, preferences, motivation).</p>
          </div>

          {/* Read-only Step 1 Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Your Application Summary</CardTitle>
              <CardDescription>This information was submitted in Step 1 and cannot be edited here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{application?.full_name}</span>
                </div>
                {application?.bio && (
                  <div>
                    <span className="text-muted-foreground">Bio</span>
                    <p className="mt-1 text-foreground">{application.bio}</p>
                  </div>
                )}
                {application?.coach_background && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Background</span>
                    <span className="font-medium">{application.coach_background}</span>
                  </div>
                )}
                {application?.coaching_experience_years && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coaching Experience</span>
                    <span className="font-medium">{application.coaching_experience_years}</span>
                  </div>
                )}
                {application?.coaching_experience_level && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Experience Level</span>
                    <span className="font-medium">{application.coaching_experience_level}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Complete your coaching profile to get started with Galoras.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Conditional Founder fields (based on Step 1 background) */}
                {isFounderBackground(coachBackground) && (
                  <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Founder Details</h4>
                    <div className="space-y-2">
                      <Label>Founder Stage Focus</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {FOUNDER_STAGE_OPTIONS.map((opt) => (
                          <div key={opt} className="flex items-center space-x-2">
                            <Checkbox id={`onb-fs-${opt}`} checked={founderStageFocus.includes(opt)} onCheckedChange={(c) => toggleArray(setFounderStageFocus, opt, c as boolean)} />
                            <Label htmlFor={`onb-fs-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Functional Strengths</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {FOUNDER_FUNCTION_OPTIONS.map((opt) => (
                          <div key={opt} className="flex items-center space-x-2">
                            <Checkbox id={`onb-ff-${opt}`} checked={founderFunctionStrength.includes(opt)} onCheckedChange={(c) => toggleArray(setFounderFunctionStrength, opt, c as boolean)} />
                            <Label htmlFor={`onb-ff-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Executive fields */}
                {isExecutiveBackground(coachBackground) && (
                  <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Executive Details</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Executive Level</Label>
                        <Select value={execLevel} onValueChange={setExecLevel}>
                          <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                          <SelectContent>
                            {EXEC_LEVEL_OPTIONS.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Executive Functions</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {EXEC_FUNCTION_OPTIONS.map((opt) => (
                          <div key={opt} className="flex items-center space-x-2">
                            <Checkbox id={`onb-ef-${opt}`} checked={execFunction.includes(opt)} onCheckedChange={(c) => toggleArray(setExecFunction, opt, c as boolean)} />
                            <Label htmlFor={`onb-ef-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Pillar Taxonomy */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Coaching Pillar</h3>
                  <p className="text-sm text-muted-foreground">Select your primary coaching pillar and any secondary areas.</p>
                  <div className="space-y-2">
                    <Label>Primary Pillar *</Label>
                    <Select value={primaryPillar} onValueChange={(v) => { setPrimaryPillar(v); setSecondaryPillars(prev => prev.filter(p => p !== v)); }}>
                      <SelectTrigger><SelectValue placeholder="Select primary pillar" /></SelectTrigger>
                      <SelectContent>
                        {PRIMARY_PILLAR_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Pillars</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {PRIMARY_PILLAR_OPTIONS.filter(p => p !== primaryPillar).map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <Checkbox id={`onb-sp-${opt}`} checked={secondaryPillars.includes(opt)} onCheckedChange={(c) => toggleArray(setSecondaryPillars, opt, c as boolean)} />
                          <Label htmlFor={`onb-sp-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Coaching Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Coaching Preferences</h3>
                  <div className="space-y-2">
                    <Label>Industry Focus</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {INDUSTRY_FOCUS_OPTIONS.map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <Checkbox id={`onb-if-${opt}`} checked={industryFocus.includes(opt)} onCheckedChange={(c) => toggleArray(setIndustryFocus, opt, c as boolean)} />
                          <Label htmlFor={`onb-if-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Coaching Style</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {COACHING_STYLE_OPTIONS.map((opt) => (
                        <div key={opt} className="flex items-center space-x-2">
                          <Checkbox id={`onb-cs-${opt}`} checked={coachingStyle.includes(opt)} onCheckedChange={(c) => toggleArray(setCoachingStyle, opt, c as boolean)} />
                          <Label htmlFor={`onb-cs-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Engagement Model</Label>
                      <Select value={engagementModel} onValueChange={setEngagementModel}>
                        <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                        <SelectContent>
                          {ENGAGEMENT_MODEL_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Availability</Label>
                      <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
                        <SelectTrigger><SelectValue placeholder="Select availability" /></SelectTrigger>
                        <SelectContent>
                          {AVAILABILITY_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Detailed Specialties */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Detailed Specialties (Optional)</h3>
                  <p className="text-sm text-muted-foreground">Select specific areas of expertise</p>
                  <div className="space-y-4">
                    {Object.entries(PILLAR_SPECIALTIES).map(([pillar, specialties]) => (
                      <div key={pillar}>
                        <p className="text-sm font-semibold text-muted-foreground mb-2">{pillar}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {specialties.map((s) => (
                            <div key={s} className="flex items-center space-x-2">
                              <Checkbox id={`onb-${s}`} checked={pillarSpecialties.includes(s)} onCheckedChange={(c) => handlePillarChange(s, c as boolean)} />
                              <Label htmlFor={`onb-${s}`} className="text-sm cursor-pointer">{s}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motivation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Motivation</h3>
                  <div className="space-y-2">
                    <Label>Primary Reason for Joining *</Label>
                    <Select value={primaryJoinReason} onValueChange={setPrimaryJoinReason}>
                      <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                      <SelectContent>
                        {JOIN_REASON_OPTIONS.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Coaching Commitment Level *</Label>
                    <Select value={commitmentLevel} onValueChange={setCommitmentLevel}>
                      <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        {COMMITMENT_LEVEL_OPTIONS.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>When Would You Like to Begin? *</Label>
                    <Select value={startTimeline} onValueChange={setStartTimeline}>
                      <SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger>
                      <SelectContent>
                        {START_TIMELINE_OPTIONS.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excitement">What excites you most about coaching?</Label>
                    <Textarea id="excitement" rows={2} maxLength={200} value={excitementNote} onChange={(e) => setExcitementNote(e.target.value)} placeholder="Optional — max 200 characters" />
                    <p className="text-xs text-muted-foreground text-right">{excitementNote.length}/200</p>
                  </div>
                </div>

                {/* LinkedIn URL */}
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="flex items-center gap-2"><Linkedin className="h-4 w-4" />LinkedIn URL</Label>
                  <Input id="linkedinUrl" type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
                </div>

                {/* Profile Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl" className="flex items-center gap-2"><Image className="h-4 w-4" />Profile Image URL</Label>
                  <Input id="avatarUrl" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/your-photo.jpg" />
                  <p className="text-sm text-muted-foreground">Enter a URL to your professional photo (optional).</p>
                </div>

                {/* Booking URL */}
                <div className="space-y-2">
                  <Label htmlFor="bookingUrl" className="flex items-center gap-2"><Calendar className="h-4 w-4" />Booking Link (e.g., Calendly)</Label>
                  <Input id="bookingUrl" type="url" value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} placeholder="https://calendly.com/yourname" />
                  <p className="text-sm text-muted-foreground">Optional — must start with https://</p>
                </div>

                <Button type="submit" className="w-full" disabled={state === "submitting"}>
                  {state === "submitting" ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : "Complete Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
