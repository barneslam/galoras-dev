import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BarChart3, Users, Brain, Target, ArrowRight, CheckCircle2, FileText } from "lucide-react";

const assessments = [
  {
    icon: Users,
    title: "360° Leadership Assessment",
    description: "Comprehensive feedback from peers, direct reports, and managers. Understand how your leadership is perceived across all levels.",
    duration: "2-3 weeks",
    deliverables: ["Individual reports", "Coaching debrief", "Development plan"]
  },
  {
    icon: Brain,
    title: "Team Dynamics Assessment",
    description: "Measure team health, psychological safety, and collaboration patterns. Identify strengths and areas for improvement.",
    duration: "1-2 weeks",
    deliverables: ["Team report", "Workshop facilitation", "Action roadmap"]
  },
  {
    icon: BarChart3,
    title: "Culture Diagnostic",
    description: "Deep dive into your organization's culture. Understand the gap between stated values and lived experience.",
    duration: "4-6 weeks",
    deliverables: ["Culture report", "Executive presentation", "Transformation plan"]
  },
  {
    icon: Target,
    title: "Performance Readiness Assessment",
    description: "Evaluate your organization's readiness to achieve its strategic goals. Identify barriers and enablers.",
    duration: "3-4 weeks",
    deliverables: ["Readiness scorecard", "Gap analysis", "Priority recommendations"]
  }
];

const process = [
  { step: "1", title: "Discovery Call", description: "Understand your goals and select the right assessment." },
  { step: "2", title: "Design & Launch", description: "Customize the assessment and deploy to participants." },
  { step: "3", title: "Data Collection", description: "Gather responses with our validated instruments." },
  { step: "4", title: "Analysis", description: "Expert analysis and insight generation." },
  { step: "5", title: "Debrief & Action", description: "Present findings and create actionable plans." }
];

const Diagnostics = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="container-wide relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Diagnostics & Assessment</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient">
              Measure What Matters
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Data-driven insights into your organization's leadership, culture, and team dynamics. 
              Know where you stand. Know where to focus.
            </p>
            <Button size="lg" asChild>
              <Link to="/contact">Get Started <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Assessments Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Assessments</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Validated instruments that provide actionable insights.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {assessments.map((assessment, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <assessment.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{assessment.title}</CardTitle>
                  <CardDescription className="text-base">{assessment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <FileText className="w-4 h-4" />
                    <span>Duration: {assessment.duration}</span>
                  </div>
                  <h4 className="font-medium mb-2 text-sm">Deliverables:</h4>
                  <ul className="space-y-1">
                    {assessment.deliverables.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A structured approach that delivers insights you can act on.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 justify-between max-w-4xl mx-auto">
            {process.map((item, index) => (
              <div key={index} className="flex-1 text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {index < process.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-border -z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="glass rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Schedule a discovery call to discuss which assessment is right for your organization.
            </p>
            <Button size="lg" asChild>
              <Link to="/contact">Schedule Discovery Call <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Diagnostics;
