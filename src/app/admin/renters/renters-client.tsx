"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { RenterFormDialog } from "@/components/admin/renter-form-dialog";
import { deleteRenter } from "@/actions/renters";
import { useTranslations } from "@/components/providers/locale-provider";
import type { RenterWithUser } from "@/types";

interface RentersPageClientProps {
  renters: RenterWithUser[];
}

export function RentersPageClient({ renters }: RentersPageClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRenter, setEditingRenter] = useState<RenterWithUser | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { t } = useTranslations();

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.renters.deleteConfirm"))) return;
    setDeletingId(id);
    try {
      const result = await deleteRenter(id);
      if (result.success) {
        toast.success(t("admin.renters.deleted"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error(t("admin.renters.saveFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <DashboardHeader
        title={t("admin.renters.title")}
        description={t("admin.renters.description")}
      >
        <Button
          onClick={() => {
            setEditingRenter(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.renters.addRenter")}
        </Button>
      </DashboardHeader>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.renters.name")}</TableHead>
              <TableHead>{t("admin.renters.email")}</TableHead>
              <TableHead>{t("admin.renters.meterNumber")}</TableHead>
              <TableHead>{t("admin.renters.mobile")}</TableHead>
              <TableHead>{t("admin.renters.bills")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t("admin.renters.noRenters")}
                </TableCell>
              </TableRow>
            ) : (
              renters.map((renter) => (
                <TableRow key={renter.id}>
                  <TableCell className="font-medium">{renter.user.name}</TableCell>
                  <TableCell>{renter.user.email}</TableCell>
                  <TableCell>{renter.meterNumber}</TableCell>
                  <TableCell>{renter.mobile}</TableCell>
                  <TableCell>{renter._count?.bills ?? 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingRenter(renter);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(renter.id)}
                        disabled={deletingId === renter.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RenterFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        renter={editingRenter}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
