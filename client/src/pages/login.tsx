import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { LockKeyhole, Mail } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const loginSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      setLocation("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Ongeldig e-mailadres of wachtwoord",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/static/123.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.7
        }}
      />

      <Card className="w-full max-w-[420px] bg-white/80 backdrop-blur-md border-0 shadow-xl">
        <CardContent className="pt-8 px-6">
          <div className="text-center mb-8">
            <div className="w-full flex justify-center items-center">
              <img
                src="/static/moskee.png"
                alt="Sufuf"
                className="h-20 sm:h-24 mx-auto mb-6"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#963E56] mb-2">
              Sufuf
            </h1>
            <p className="text-gray-600">
              Log in om door te gaan
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#963E56]" />
                      <FormControl>
                        <Input
                          placeholder="E-mailadres"
                          className="h-11 pl-10 bg-white/50 border-[#D9A347] focus:border-[#6BB85C] focus:ring-[#6BB85C]"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#963E56]" />
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Wachtwoord"
                          className="h-11 pl-10 bg-white/50 border-[#D9A347] focus:border-[#6BB85C] focus:ring-[#6BB85C]"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setResetDialogOpen(true)}
                  className="text-[#963E56] hover:text-[#6BB85C] transition-colors"
                >
                  Wachtwoord vergeten?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[#963E56] hover:bg-[#6BB85C] transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Bezig met inloggen..." : "Inloggen"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#963E56]">Wachtwoord resetten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              type="email"
              placeholder="Voer je e-mailadres in"
              className="w-full border-[#D9A347] focus:border-[#6BB85C] focus:ring-[#6BB85C]"
            />
            <Button
              className="w-full bg-[#963E56] hover:bg-[#6BB85C]"
              onClick={() => {
                toast({
                  title: "Reset link verzonden",
                  description: "Check je e-mail voor verdere instructies",
                  duration: 3000,
                });
                setResetDialogOpen(false);
              }}
            >
              Verstuur reset link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}