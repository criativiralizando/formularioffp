import { ColetaDadosForm } from "@/components/ColetaDadosForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-2 lg:p-0 overflow-hidden">
      <main className="w-full max-w-4xl max-h-[95vh] flex items-center justify-center relative">
        <ColetaDadosForm />
      </main>

      {/* Persistent Footer - fixed bottom to avoid scroll */}
      <footer className="fixed bottom-4 text-center text-[10px] uppercase tracking-widest text-slate-500 dark:text-muted-foreground/30 pointer-events-none">
        <p>&copy; {new Date().getFullYear()} Fly Per Points. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
