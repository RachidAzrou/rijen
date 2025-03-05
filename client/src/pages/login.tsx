import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { LockKeyhole, Mail } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(6, "Wachtwoord moet minimaal 6 tekens bevatten"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const getFirebaseErrorMessage = (error: AuthError) => {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Ongeldig e-mailadres formaat';
    case 'auth/user-disabled':
      return 'Dit account is uitgeschakeld';
    case 'auth/user-not-found':
      return 'Geen account gevonden met dit e-mailadres';
    case 'auth/wrong-password':
      return 'Onjuist wachtwoord';
    default:
      return `Er is een fout opgetreden bij het inloggen: ${error.message}`;
  }
};

export default function Login() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      setLocation("/");
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);
      toast({
        variant: "destructive",
        title: "Inloggen mislukt",
        description: getFirebaseErrorMessage(error),
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        background: `url('/static/123.jpg') center center/cover no-repeat fixed`
      }}
    >
      <Card className="w-full max-w-[420px] bg-white/80 backdrop-blur-md border-0 shadow-xl">
        <CardContent className="pt-8 px-6">
          <div className="text-center mb-8">
            <div className="w-full flex justify-center items-center">
              <img
                src="/static/Naamloos2.png"
                alt="MEFEN"
                className="h-32 sm:h-40 mx-auto mb-6"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#963E56] mb-2">
              Sufuf App
            </h1>
            <p className="text-gray-600">
              Beheer je gebedsruimtes
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
                          type="email"
                          placeholder="E-mailadres"
                          className="h-11 pl-10 bg-white/50 border-[#D9A347] focus:border-[#6BB85C] focus:ring-[#6BB85C]"
                          disabled={isLoading}
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
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
    </div>
  );
}