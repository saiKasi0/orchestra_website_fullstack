"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Users, 
  UserPlus,
  Trash2, 
  Loader2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // New user form state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserRole, setNewUserRole] = useState("leadership");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users);
      } else {
        toast.error("Failed to load users");
        console.error("Error loading users:", data.error);
      }
    } catch (error) {
      toast.error("An error occurred while fetching users");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    const checks = [
      password.length >= 10,                  // Length check
      /[A-Z]/.test(password),                 // Uppercase check
      /[a-z]/.test(password),                 // Lowercase check
      /[0-9]/.test(password),                 // Number check
      /[^A-Za-z0-9]/.test(password),          // Special character check
    ];
    
    const strength = checks.filter(Boolean).length;
    setPasswordStrength(strength);
    
    if (password && strength < 5) {
      setPasswordError(
        "Password must be at least 10 characters and include uppercase, lowercase, numbers, and special characters."
      );
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password first
    if (!validatePassword(newUserPassword)) {
      toast.error("Please fix password issues before submitting");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail,
          fullName: newUserFullName,
          role: newUserRole,
          password: newUserPassword,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`${newUserRole.charAt(0).toUpperCase() + newUserRole.slice(1)} user created successfully`);
        fetchUsers();
        setAddDialogOpen(false);
        resetNewUserForm();
      } else {
        toast.error(data.message || "Failed to create user");
      }
    } catch (error) {
      toast.error("An error occurred while creating the user");
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("User role updated successfully");
        // Update local state to reflect the change
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        toast.error(data.message || "Failed to update user role");
      }
    } catch (error) {
      toast.error("An error occurred while updating the user role");
      console.error("Error:", error);
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("User deleted successfully");
        // Remove user from local state
        setUsers(users.filter(user => user.id !== selectedUser.id));
        setDeleteDialogOpen(false);
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the user");
      console.error("Error:", error);
    }
  };

  const resetNewUserForm = () => {
    setNewUserEmail("");
    setNewUserFullName("");
    setNewUserRole("leadership");
    setNewUserPassword("");
  };

  const confirmDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  return (
    <AdminPageLayout allowedRoles={["admin"]} title="User Management">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Users
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchUsers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={createUser}>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>
                        Create a new user account. All fields including password are required.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fullName" className="text-right">
                          Full Name
                        </Label>
                        <Input
                          id="fullName"
                          value={newUserFullName}
                          onChange={(e) => setNewUserFullName(e.target.value)}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                          Role
                        </Label>
                        <Select
                          value={newUserRole}
                          onValueChange={setNewUserRole}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="leadership">Leadership</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">
                          Password
                        </Label>
                        <div className="col-span-3 space-y-2">
                          <Input
                            id="password"
                            type="password"
                            value={newUserPassword}
                            onChange={(e) => {
                              setNewUserPassword(e.target.value);
                              validatePassword(e.target.value);
                            }}
                            required
                            className={cn(
                              passwordError && "border-red-500 focus-visible:ring-red-500"
                            )}
                          />
                          
                          {passwordStrength > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={cn(
                                  "h-1.5 rounded-full transition-all duration-300",
                                  passwordStrength === 1 && "w-1/5 bg-red-500",
                                  passwordStrength === 2 && "w-2/5 bg-red-500",
                                  passwordStrength === 3 && "w-3/5 bg-yellow-500",
                                  passwordStrength === 4 && "w-4/5 bg-yellow-500",
                                  passwordStrength === 5 && "w-full bg-green-500"
                                )}
                              />
                            </div>
                          )}
                          
                          {passwordError && (
                            <p className="text-xs text-red-500">{passwordError}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create User
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>
                            {user.role === "admin" ? "Admin" : "Leadership"}
                          </Badge>
                          {/* Only show role changer if not the current user */}
                          {user.email !== session?.user?.email && (
                            <Select
                              defaultValue={user.role}
                              onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                            >
                              <SelectTrigger className="w-28 h-7">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Administrator</SelectItem>
                                <SelectItem value="leadership">Leadership</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {/* Prevent self-deletion */}
                        {user.email !== session?.user?.email && (
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(user)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Delete confirmation dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.full_name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteUser}>
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminPageLayout>
  );
}