import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

declare global {
  interface Window {
    __locatorConfigured?: boolean;
  }
}

const LOCATOR_CONFIG = {
  locations: [
    {
      title: 'MD Modas',
      address1: 'Rua Santa Luzia, 550',
      address2: 'Aventureiro, Joinville - SC, Brasil',
      coords: { lat: -26.2694, lng: -48.8077 },
      actions: [
        {
          label: 'WhatsApp da loja',
          defaultUrl:
            'https://wa.me/5547984468103?text=' +
            encodeURIComponent('Olá! Quero falar com a MD Modas sobre retirada de pedido.'),
        },
      ],
    },
  ],
  mapOptions: {
    center: { lat: -26.2694, lng: -48.8077 },
    fullscreenControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 15,
    zoomControl: true,
    maxZoom: 17,
    mapId: '',
  },
  mapsApiKey: import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY ?? '',
  capabilities: {
    input: true,
    autocomplete: true,
    directions: false,
    distanceMatrix: true,
    details: false,
    actions: true,
  },
};

export const Route = createFileRoute('/loja')({
  head: () => ({
    meta: [
      { title: 'Nossa Loja em Joinville | MD Modas' },
      {
        name: 'description',
        content:
          'Visite a MD Modas em Joinville: Rua Santa Luzia, 550 – Aventureiro. Veja no mapa como chegar, calcule a distância e fale conosco pelo WhatsApp.',
      },
      { property: 'og:title', content: 'Nossa Loja em Joinville | MD Modas' },
      {
        property: 'og:description',
        content: 'MD Modas: Rua Santa Luzia, 550 – Aventureiro, Joinville - SC. Veja como chegar no mapa.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: LojaPage,
});

function LojaPage() {
  useEffect(() => {
    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    if (!key) return;

    // Extended Component Library (store locator web component)
    if (!document.querySelector('script[data-gmpx-lib]')) {
      const lib = document.createElement('script');
      lib.type = 'module';
      lib.src =
        'https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.15/index.min.js';
      lib.setAttribute('data-gmpx-lib', '1');
      document.head.appendChild(lib);
    }

    const configTimer = window.setInterval(() => {
      const locator = document.querySelector('gmpx-store-locator') as
        | (HTMLElement & { configureFromQuickBuilder?: (cfg: unknown) => void })
        | null;
      if (!locator) return;
      const loader = document.querySelector('gmpx-api-loader');
      if (loader && !loader.getAttribute('key')) loader.setAttribute('key', key);
      Promise.resolve(customElements.whenDefined('gmpx-store-locator')).then(() => {
        if (!window.__locatorConfigured && locator.configureFromQuickBuilder) {
          locator.configureFromQuickBuilder(LOCATOR_CONFIG);
          window.__locatorConfigured = true;
        }
        window.clearInterval(configTimer);
      });
    }, 500);

    return () => window.clearInterval(configTimer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumbs
        items={[
          { name: 'Início', href: '/' },
          { name: 'Nossa Loja' },
        ]}
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Nossa Loja</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rua Santa Luzia, 550 – Aventureiro, Joinville - SC. Busque seu endereço no mapa para
          calcular a distância até a loja.
        </p>
        <div
          className="mt-6 rounded-xl overflow-hidden border border-border"
          style={{ height: '70vh', minHeight: 420 }}
        >
          {/* @ts-expect-error web components */}
          <gmpx-api-loader
            key={import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY ?? ''}
            solution-channel="GMP_QB_locatorplus_v11_cABDF"
          />
          {/* @ts-expect-error web components */}
          <gmpx-store-locator style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  );
}
