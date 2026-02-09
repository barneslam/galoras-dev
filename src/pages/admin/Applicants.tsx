import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Loader2, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

interface CoachApplication {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  bio: string | null;
  experience_years: number | null;
  specialties: string[] | null;
}

export default function Applicants() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applications, setApplications] = useState<CoachApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/");
      return;
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      setIsAdmin(false);
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchApplications();
  };

  const fetchApplications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("coach_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching applications",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setApplications(data || []);
    }
    setIsLoading(false);
  };

  const updateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    setUpdatingId(id);
    
    const { error } = await supabase
      .from("coach_applications")
      .update({ 
        status: newStatus,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: `Application ${newStatus}`,
        description: `The application has been ${newStatus}.`,
      });
      // Update local state immediately
      setApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    }
    setUpdatingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  if (isAdmin === null) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <section className="py-16">
        <div className="container-wide">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Coach Applications</CardTitle>
                  <CardDescription>Review and manage coach applications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No applications found.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.full_name}</TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>{format(new Date(app.created_at), "MMM d, yyyy")}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                disabled={app.status === "approved" || updatingId === app.id}
                                onClick={() => updateStatus(app.id, "approved")}
                              >
                                {updatingId === app.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={app.status === "rejected" || updatingId === app.id}
                                onClick={() => updateStatus(app.id, "rejected")}
                              >
                                {updatingId === app.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
