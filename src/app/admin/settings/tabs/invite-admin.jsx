"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePost, useFetchData } from "@/hooks/useApi";
import {
  Loader2,
  Send,
  Users,
  Mail,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function InviteAdmin() {
  const [email, setEmail] = useState("");

  // Fetch invitations data
  const {
    data: invitationsData,
    isLoading: isLoadingInvitations,
    refetch: refetchInvitations,
  } = useFetchData("/api/admin/invitations", ["admin-invitations"]);

  const sendInvite = usePost("/api/admin/invitations");

  // Transform fetched data to match component format
  const sentInvites = useMemo(() => {
    if (!invitationsData?.data) return [];
    
    return invitationsData.data.map((invite) => ({
      _id: invite._id,
      email: invite.email,
      status: invite.status.toLowerCase(),
      sentAt: new Date(invite.createdAt),
      invitedBy: invite.invitedBy,
      expiresAt: invite.expiresAt,
    }));
  }, [invitationsData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    sendInvite.mutate(
      { email: email.toLowerCase().trim() },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(res.message || "Invitation sent successfully!");
            setEmail("");
            refetchInvitations(); // Refresh the invitations list
          } else {
            toast.error(res.message || "Failed to send invitation");
          }
        },
        onError: (error) => {
          toast.error("Something went wrong. Please try again.");
          console.error("Invitation error:", error);
        },
      }
    );
  };

  const handleResend = (inviteId, inviteEmail) => {
    sendInvite.mutate(
      { email: inviteEmail.toLowerCase().trim() },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success("Invitation resent successfully!");
            refetchInvitations(); // Refresh the invitations list
          } else {
            toast.error(res.message || "Failed to resend invitation");
          }
        },
        onError: (error) => {
          toast.error("Failed to resend invitation");
          console.error("Resend error:", error);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Invite Admin Card */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Invite New Admin
              </h2>
              <p className="text-sm text-gray-600">
                Send an invitation email to add new administrators to your
                platform. They will receive a secure signup link valid for 24
                hours.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter admin email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                disabled={sendInvite.isPending}
              />
              <p className="text-xs text-gray-500 mt-2">
                The recipient will receive an invitation email with a signup
                link.
              </p>
            </div>

            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                className="bg-[#3C3CF6] hover:bg-[#2e2ee6] text-white min-w-[160px]"
                disabled={sendInvite.isPending || !email}
              >
                {sendInvite.isPending ? (
                  <>
                    Sending Invitation
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  </>
                ) : (
                  <>
                    Send Invitation
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Recent Invitations Card - Shows all invitations */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Invitations
              </h2>
              <p className="text-sm text-gray-600">
                Track the status of the invitations you have sent
              </p>
            </div>
          </div>

          {isLoadingInvitations ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
              <p className="text-sm text-gray-600">Loading invitations...</p>
            </div>
          ) : sentInvites.length > 0 ? (
            <div className="space-y-4">
              {sentInvites.map((invite) => (
                <div
                  key={invite._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      invite.status === "pending" 
                        ? "bg-yellow-100 text-yellow-600" 
                        : invite.status === "accepted" 
                        ? "bg-green-100 text-green-600" 
                        : "bg-red-100 text-red-600"
                    }`}>
                      {invite.status === "pending" ? (
                        <Clock className="w-5 h-5" />
                      ) : invite.status === "accepted" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{invite.email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <StatusBadge status={invite.status} />
                        <span className="text-xs text-gray-500">
                          Sent {formatTimeAgo(invite.sentAt)}
                        </span>
                        {invite.invitedBy && (
                          <span className="text-xs text-gray-500">
                            • Invited by: {invite.invitedBy.fullName}
                          </span>
                        )}
                        {invite.expiresAt && invite.status === "pending" && (
                          <span className="text-xs text-gray-500">
                            • Expires: {formatDate(invite.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {invite.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResend(invite._id, invite.email)}
                      disabled={sendInvite.isPending}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      {sendInvite.isPending ? (
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3 mr-2" />
                      )}
                      Resend
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">
                No invitations sent yet
              </h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Invitations you send will appear here with their current status.
                Start by inviting a new admin above.
              </p>
            </div>
          )}

          {/* Invitation Status Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Invitation Status
            </h4>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Accepted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Expired</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Security & Permissions
                </h3>
                <p className="text-sm text-gray-600">
                  New admins will have full access to the dashboard and all administrative features.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Important Notes:
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Invitations expire after 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Each email can only have one active invitation at a time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>You can resend expired invitations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Invited admins must use the same email to sign up</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for status badge
function StatusBadge({ status }) {
  const config = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    accepted: { label: "Accepted", className: "bg-green-100 text-green-800" },
    expired: { label: "Expired", className: "bg-red-100 text-red-800" },
  };

  const { label, className } = config[status] || { label: "Unknown", className: "bg-gray-100 text-gray-800" };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
      {label}
    </span>
  );
}

// Helper function to format time ago
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 2592000)} months ago`;
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}