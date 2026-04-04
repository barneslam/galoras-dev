import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

export default function CoachMatching() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    situation: "",
    stage: "",
    urgency: "",
    outcome: "",
  });

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <Layout>
      <div className="container-wide max-w-3xl py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Performance Context Mapping
          </h1>
          <p className="text-muted-foreground">
            Define your situation before selecting a coach.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10 text-center text-sm text-muted-foreground">
          Step {step} of 4
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              What are you dealing with?
            </h2>

            <Select onValueChange={(v) => update("situation", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select situation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scaling">Scaling business</SelectItem>
                <SelectItem value="transition">Career transition</SelectItem>
                <SelectItem value="performance">Performance pressure</SelectItem>
                <SelectItem value="leadership">Leadership challenge</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => setStep(2)}
              className="w-full"
              disabled={!form.situation}
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">What stage are you in?</h2>

            <Select onValueChange={(v) => update("stage", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="early">Early stage</SelectItem>
                <SelectItem value="growth">Growth stage</SelectItem>
                <SelectItem value="mature">Mature organization</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="w-full"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                className="w-full"
                disabled={!form.stage}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">How urgent is this?</h2>

            <Select onValueChange={(v) => update("urgency", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low urgency</SelectItem>
                <SelectItem value="medium">Moderate urgency</SelectItem>
                <SelectItem value="high">High urgency</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="w-full"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                className="w-full"
                disabled={!form.urgency}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <h2 className="text-xl font-semibold">
              What outcome do you want?
            </h2>

            <Select onValueChange={(v) => update("outcome", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clarity">Clarity</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="execution">Execution improvement</SelectItem>
                <SelectItem value="transition">Successful transition</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(3)}
                className="w-full"
              >
                Back
              </Button>
              <Button
                onClick={() =>
                  navigate(
                    `/coaching?context=${encodeURIComponent(form.situation)}`
                  )
                }
                className="w-full"
                disabled={!form.outcome}
              >
                See Matching Coaches
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}