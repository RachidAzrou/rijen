import { Card, CardContent } from "@/components/ui/card";
// ... other imports remain the same ...

export default function Login() {
  // ... other code remains the same ...

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("/static/123.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.7
        }}
      />

      <Card className="w-full max-w-[420px] bg-white/80 backdrop-blur-md border-0 shadow-xl relative z-10">
        {/* Rest of the login form remains the same */}
      </Card>
    </div>
  );
}
