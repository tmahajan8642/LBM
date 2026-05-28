"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { propertyOwnerSchema, type PropertyOwnerInput } from "@/lib/validations";
import { createPropertyOwner } from "@/actions/property-owners";

interface PropertyOwnerRow {
  id: string;
  user: { id: string; name: string; email: string };
  _count: { renters: number };
}

export function PropertyOwnersClient({ owners }: { owners: PropertyOwnerRow[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PropertyOwnerInput>({
    resolver: zodResolver(propertyOwnerSchema),
  });

  const onSubmit = async (data: PropertyOwnerInput) => {
    setLoading(true);
    try {
      const result = await createPropertyOwner(data);
      if (result.success) {
        toast.success("Property owner created");
        reset();
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to create property owner");
      }
    } catch {
      toast.error("Failed to create property owner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Property Owners"
        description="Create property owners. Admin has analytics-only access beyond this."
      />

      <div className="grid gap-6 xl:grid-cols-[460px,1fr]">
        <Card className="border-border/70">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-4 w-4" />
              Add Property Owner
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-xl space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="space-y-2">
                  <Label htmlFor="owner-name">Full Name</Label>
                  <Input id="owner-name" placeholder="e.g. Aarav Property" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner-email">Email</Label>
                  <Input id="owner-email" type="email" placeholder="owner@lightbill.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-password">Password</Label>
                <div className="relative">
                  <Input
                    id="owner-password"
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                    placeholder="Minimum 6 characters"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="h-10 w-full sm:w-auto sm:min-w-40" disabled={loading}>
                {loading ? <LoadingSpinner className="mr-2" /> : null}
                Create Owner
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Owner List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Renters</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owners.map((owner) => (
                    <TableRow key={owner.id}>
                      <TableCell className="font-medium">{owner.user.name}</TableCell>
                      <TableCell>{owner.user.email}</TableCell>
                      <TableCell>{owner._count.renters}</TableCell>
                    </TableRow>
                  ))}
                  {owners.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No property owners created yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
