"use client";

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "@/components/providers/locale-provider";

export default function ContactPage() {
  const { t } = useTranslations();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success(t("contact.success"));
    setLoading(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold">{t("contact.title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("contact.subtitle")}</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{t("contact.email")}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">support@lightbill.com</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{t("contact.phone")}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">+91 98765 43210</CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">{t("contact.address")}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              123 Tech Park, Mumbai, Maharashtra 400001
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("contact.formTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("contact.name")}</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("contact.email")}</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">{t("contact.message")}</Label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("contact.sending") : t("contact.send")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
