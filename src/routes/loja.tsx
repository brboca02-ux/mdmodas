import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { MapPin, MessageCircle, Navigation } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { STORE_INFO, buildWhatsAppLink } from '@/lib/shopify';

const STORE_ADDRESS = `${STORE_INFO.street}, ${STORE_INFO.city}, ${STORE_INFO.region}, Brasil`;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE_ADDRESS)}`;

export const Route = createFileRoute('/loja')({
  head: () => ({
    meta: [
      { title: 'Nossa Loja em Joinville | MD Modas' },
      { name: 'description', content: 'Visite a MD Modas na Rua Santa Luzia, 550, Aventureiro, Joinville. Veja a localização no Google Maps e trace sua rota até a loja.' },
      { property: 'og:title', content: 'Nossa Loja em Joinville | MD Modas' },
      { property: 'og:description', content: 'Encontre a MD Modas: Rua Santa Luzia, 550, Aventureiro, Joinville - SC. Veja o mapa e como chegar.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [{ rel: 'canonical', href: 'https://mdmoda.com.br/loja' }],
  }),
  component: LojaPage,
});

function LojaPage() {
  // The managed browser key only permits Lovable domains. The address-based
  // public embed remains usable on the store's custom domain, without Places.
  const [mapUrl, setMapUrl] = useState(STORE_INFO.mapsEmbed);
  useEffect(() => {
    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    const allowedHost = /\.(lovable\.app|lovableproject\.com)$/.test(window.location.hostname);
    if (key && allowedHost) {
      setMapUrl(`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${encodeURIComponent(STORE_ADDRESS)}&language=pt-BR`);
    }
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Breadcrumbs items={[{ name: 'Início', href: '/' }, { name: 'Nossa Loja' }]} />
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Nossa Loja — MD Modas</h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-5">
            <h2 className="text-xl font-semibold">MD Modas em Joinville</h2>
            <p className="flex items-start gap-3 text-muted-foreground">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <span>{STORE_INFO.street}<br />{STORE_INFO.city}/{STORE_INFO.region}<br />CEP {STORE_INFO.postalCode}</span>
            </p>
            <p className="text-sm text-muted-foreground">{STORE_INFO.phone}</p>
            <div className="flex flex-wrap gap-3 lg:flex-col lg:items-start">
              <Button asChild><a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer"><Navigation className="h-4 w-4" />Como chegar</a></Button>
              <Button variant="outline" asChild><a href={buildWhatsAppLink('Olá! Quero falar com a MD Modas sobre uma visita à loja.')} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" />WhatsApp da loja</a></Button>
            </div>
          </div>
          <iframe title="Localização da MD Modas — Rua Santa Luzia, 550, Joinville" src={mapUrl} className="h-[480px] w-full border-0 sm:h-[600px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
      </section>
    </main>
  );
}
