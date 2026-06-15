import { Mail, MessageCircle, Globe, Send, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";
import { Logo } from "@/components/brand/Logo";
export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 dark:border-white/10 dark:bg-slate-950">
      <Container>
        <div className="grid gap-8 md:grid-cols-3">
          <div><Logo /><p className="mt-4 text-sm leading-6 text-mutedText dark:text-slate-400">{siteConfig.description}</p></div>
          <div><h3 className="font-semibold text-primary dark:text-white">Contact</h3><div className="mt-4 space-y-3 text-sm text-mutedText dark:text-slate-400"><p className="flex items-center gap-2"><Mail size={16} />{siteConfig.contact.email}</p><p className="flex items-center gap-2"><Send size={16} />{siteConfig.contact.telegram}</p><p className="flex items-center gap-2"><MessageCircle size={16} />{siteConfig.contact.line}</p><p className="flex items-center gap-2"><Phone size={16} />66 82 603 9244</p><p className="flex items-center gap-2"><Globe size={16} />{siteConfig.contact.website}</p></div></div>
          <div><h3 className="font-semibold text-primary dark:text-white">Links</h3><div className="mt-4 flex flex-col gap-3 text-sm text-mutedText dark:text-slate-400"><a href="#problem">Problem</a><a href="#modules">Modules</a><a href="#workflow">Workflow</a><a href="#pricing">Pricing</a><a href="#contact">Contact</a></div></div>
        </div>
        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-mutedText dark:border-white/10 dark:text-slate-500">© 2026 DevCommander OS. All Rights Reserved.</div>
      </Container>
    </footer>
  );
}
