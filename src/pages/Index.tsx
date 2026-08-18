import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionFade from "@/components/SectionFade";
import LiveStudentCounter from "@/components/LiveStudentCounter";
import CoreValues from "@/components/CoreValues";
import FirstClassVideoCard from "@/components/FirstClassVideoCard";
import { LandingEventFooter, LandingEventPopup } from "@/components/FeaturedEvent";
import { PreservedInjuSupportStrip } from "@/components/INJU_LOGO_DO_NOT_DELETE";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { curriculumClassCount } from "@/lib/curriculum";
import { fetchStockPrices, SUPPORTED_STOCKS, type StockQuote } from "@/lib/stockData";
import { ArrowRight, Users } from "lucide-react";
import { captureRefFromUrl } from "@/lib/referral";

const testimonials = [
  "Las clases me abrieron la cabeza. Ahora entiendo temas que antes me parecían aburridos.",
  "Me ayudó a organizar mejor mi dinero y a pensar en grande.",
  "Lo mejor es que podemos preguntar, debatir y participar.",
];

const DEFAULT_CAROUSEL_TICKERS = ["AAPL", "MELI", "NU", "MSFT", "META", "SPY"];
const stockNameByTicker = new Map(SUPPORTED_STOCKS.map((stock) => [stock.ticker, stock.name]));
const landingPageWidgetsTable = () => supabase.from("landing_page_widgets");

const shuffleTickers = (tickers: string[]) => [...tickers].sort(() => Math.random() - 0.5);

const demoQuoteByTicker: Record<string, Pick<StockQuote, "price" | "previousClose" | "changePercent">> = {
  AAPL: { price: null, previousClose: null, changePercent: null },
  MELI: { price: null, previousClose: null, changePercent: null },
  NU: { price: null, previousClose: null, changePercent: null },
  MSFT: { price: null, previousClose: null, changePercent: null },
  META: { price: null, previousClose: null, changePercent: null },
  SPY: { price: null, previousClose: null, changePercent: null },
};

const getDisplayQuote = (ticker: string | undefined, quote: StockQuote | undefined): StockQuote | undefined => {
  if (!ticker) return quote;
  if (quote && quote.price != null) return quote;

  const demoQuote = demoQuoteByTicker[ticker];
  if (!demoQuote) return quote;

  return {
    ticker,
    companyName: stockNameByTicker.get(ticker) || ticker,
    ...demoQuote,
  };
};

const formatUsd = (value: number | null | undefined) =>
  value == null
    ? "--"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: value >= 100 ? 0 : 2,
      }).format(value);

const formatPercent = (value: number | null | undefined) =>
  value == null ? "..." : `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

const changeClassName = (value: number | null | undefined) =>
  value == null
    ? "bg-white/10 text-white/60"
    : value >= 0
      ? "bg-emerald-400/15 text-emerald-300"
      : "bg-rose-400/15 text-rose-300";

const tableChangeClassName = (value: string) =>
  value === "TTM" || value === "USD" || value === "EPS"
    ? "bg-slate-100 text-slate-600"
    : value.startsWith("-")
    ? "bg-rose-100 text-rose-700"
    : value === "..."
      ? "bg-slate-100 text-slate-500"
      : "bg-emerald-100 text-emerald-700";

const incomeStatementByTicker: Record<string, Array<[string, string, string]>> = {
  AAPL: [
    ["Ingresos", "$391.0B", "TTM"],
    ["Costo de ingresos", "$210.4B", "54%"],
    ["Utilidad bruta", "$180.7B", "46%"],
    ["Gastos operativos", "$57.5B", "15%"],
    ["Resultado operativo", "$123.2B", "32%"],
    ["Resultado neto", "$93.7B", "24%"],
    ["EPS diluido", "$6.08", "EPS"],
  ],
  MELI: [
    ["Ingresos", "$20.8B", "TTM"],
    ["Costo de ingresos", "$11.1B", "53%"],
    ["Utilidad bruta", "$9.7B", "47%"],
    ["Gastos operativos", "$6.8B", "33%"],
    ["Resultado operativo", "$2.9B", "14%"],
    ["Resultado neto", "$1.5B", "7%"],
    ["EPS diluido", "$29.12", "EPS"],
  ],
  NU: [
    ["Ingresos", "$11.5B", "TTM"],
    ["Gastos financieros", "$3.2B", "28%"],
    ["Margen bruto", "$8.3B", "72%"],
    ["Gastos operativos", "$5.1B", "44%"],
    ["Resultado operativo", "$3.2B", "28%"],
    ["Resultado neto", "$2.0B", "17%"],
    ["EPS diluido", "$0.41", "EPS"],
  ],
  MSFT: [
    ["Ingresos", "$245.1B", "TTM"],
    ["Costo de ingresos", "$74.1B", "30%"],
    ["Utilidad bruta", "$171.0B", "70%"],
    ["Gastos operativos", "$60.0B", "24%"],
    ["Resultado operativo", "$111.0B", "45%"],
    ["Resultado neto", "$88.1B", "36%"],
    ["EPS diluido", "$11.80", "EPS"],
  ],
  META: [
    ["Ingresos", "$164.5B", "TTM"],
    ["Costo de ingresos", "$30.2B", "18%"],
    ["Utilidad bruta", "$134.3B", "82%"],
    ["Gastos operativos", "$72.2B", "44%"],
    ["Resultado operativo", "$62.1B", "38%"],
    ["Resultado neto", "$55.5B", "34%"],
    ["EPS diluido", "$21.73", "EPS"],
  ],
  SPY: [
    ["Ingresos agregados", "$2.1T", "TTM"],
    ["Costo de ingresos", "$1.2T", "57%"],
    ["Utilidad bruta", "$903B", "43%"],
    ["Gastos operativos", "$433B", "21%"],
    ["Resultado operativo", "$470B", "22%"],
    ["Resultado neto", "$375B", "18%"],
    ["EPS ponderado", "$241", "EPS"],
  ],
};

const buildBarHeights = (ticker: string, changePercent: number | null | undefined) => {
  const seed = ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const momentum = Math.round((changePercent ?? 0) * 3);
  return Array.from({ length: 7 }, (_, index) => {
    const wave = (seed + index * 17 + momentum + index * index * 5) % 54;
    return 28 + Math.abs(wave);
  });
};

const buildIncomeStatementRows = (ticker: string) =>
  incomeStatementByTicker[ticker] ?? [
    ["Ingresos", "$12.4B", "TTM"],
    ["Costo de ingresos", "$6.8B", "55%"],
    ["Utilidad bruta", "$5.6B", "45%"],
    ["Gastos operativos", "$3.1B", "25%"],
    ["Resultado operativo", "$2.5B", "20%"],
    ["Resultado neto", "$1.8B", "15%"],
    ["EPS diluido", "$4.20", "EPS"],
  ];

const DynamicStockTickerAnimation = () => {
  const { isLoggedIn, session } = useAuth();
  const [savedTickers, setSavedTickers] = useState<string[]>([]);
  const [demoTickers] = useState(() => shuffleTickers(DEFAULT_CAROUSEL_TICKERS));
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    captureRefFromUrl();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchSavedTickers = async () => {
      if (!isLoggedIn || !session?.user?.id) {
        setSavedTickers([]);
        return;
      }

      const { data } = await landingPageWidgetsTable()
        .select("tickers")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!cancelled) {
        const tickers = data?.tickers || [];
        setSavedTickers(tickers);
      }
    };

    fetchSavedTickers();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, session?.user?.id]);

  const carouselTickers = useMemo(
    () => {
      if (isLoggedIn && savedTickers.length > 0) {
        return savedTickers;
      }
      return demoTickers;
    },
    [demoTickers, isLoggedIn, savedTickers]
  );
  const carouselSignature = useMemo(() => carouselTickers.join("|"), [carouselTickers]);

  useEffect(() => {
    setActiveIndex(0);
  }, [carouselSignature]);

  useEffect(() => {
    if (!carouselTickers.length) {
      setQuotes([]);
      return;
    }

    let cancelled = false;
    const refreshQuotes = async () => {
      const nextQuotes = await fetchStockPrices(carouselTickers);
      if (!cancelled) setQuotes(nextQuotes);
    };

    refreshQuotes();
    const refreshId = window.setInterval(refreshQuotes, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(refreshId);
    };
  }, [carouselTickers]);

  useEffect(() => {
    if (carouselTickers.length <= 1) return;
    const rotationId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % carouselTickers.length);
    }, 9_500);
    return () => window.clearInterval(rotationId);
  }, [carouselTickers.length]);

  const activeTicker = carouselTickers[activeIndex % Math.max(carouselTickers.length, 1)];
  const quote = quotes.find((item) => item.ticker === activeTicker);
  const displayQuote = getDisplayQuote(activeTicker, quote);
  const companyName = displayQuote?.companyName || stockNameByTicker.get(activeTicker) || activeTicker;
  const incomeStatementRows = buildIncomeStatementRows(activeTicker || "AGORA");
  const barHeights = buildBarHeights(activeTicker || "AGORA", displayQuote?.changePercent);
  return (
    <div className="absolute inset-x-0 bottom-6 mx-auto h-[76%] w-[92%] overflow-hidden rounded-[2rem] border-2 border-blue-pop bg-[#0b0d10] shadow-[0_30px_80px_rgba(0,0,0,0.16)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.34),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(255,200,0,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent_45%)]" />
      <div className="absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-end border-b border-white/10 bg-black/20 px-4 backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
      </div>
      <div className="relative h-full px-5 pb-5 pt-14">
        <div key={`card-${activeTicker || "empty"}`} className="stock-ticker-card absolute left-1/2 top-1/2 w-[72%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/15 bg-white/[0.09] p-5 backdrop-blur-md">
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-4xl font-black leading-none text-white">{activeTicker}</p>
                <p className="mt-2 font-heading text-sm font-semibold leading-none text-white/80">{companyName}</p>
              </div>
              <span className={`rounded-full px-3 py-1.5 font-heading text-sm font-black ${changeClassName(displayQuote?.changePercent)}`}>
                {formatPercent(displayQuote?.changePercent)}
              </span>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-white/75">Precio</p>
                <p className="mt-1 font-heading text-2xl font-black leading-none text-white">{formatUsd(displayQuote?.price)}</p>
              </div>
              <div className="flex h-16 w-32 items-end gap-2">
                {barHeights.map((height, index) => (
                  <span key={`${activeTicker}-${height}-${index}`} className="stock-ticker-bar flex-1 rounded-t-full bg-blue-pop" style={{ height: `${height}%`, animationDelay: `${index * 90}ms` }} />
                ))}
              </div>
            </div>
          </>
        </div>

        <div key={`window-${activeTicker || "empty"}`} className="income-window absolute inset-x-5 bottom-5 top-10 overflow-hidden rounded-3xl border border-white/15 bg-[#f8fbff] text-[#0b1320] shadow-2xl">
          <div className="relative z-10 flex items-center justify-between border-b border-black/10 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="font-heading text-sm font-black leading-none text-[#0b1320]">Estado de resultados de {activeTicker || "tu lista"}</p>
              <p className="mt-1 font-heading text-xs font-semibold leading-none text-[#0b1320]/55">Ingresos y márgenes · USD</p>
            </div>
            <span className="income-close flex h-7 w-7 items-center justify-center rounded-full bg-[#0b1320] font-heading text-sm font-black leading-none text-white">×</span>
          </div>
          <div className="income-scroll relative z-0 px-4 py-3">
            {incomeStatementRows.map(([label, value, change]) => (
              <div key={label} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-black/10 py-3 font-heading">
                <span className="text-sm font-bold text-[#0b1320]">{label}</span>
                <span className="text-sm font-black text-[#0b1320]">{value}</span>
                <span className={`rounded-full px-2 py-1 text-xs font-black ${tableChangeClassName(change)}`}>{change}</span>
              </div>
            ))}
          </div>
        </div>

        <span className="stock-cursor" aria-hidden="true" />
      </div>
    </div>
  );
};

const Hero = () => {
  const { isLoggedIn } = useAuth();
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 30) setShowScrollHint(false);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative overflow-hidden pt-20 sm:pt-28 md:pt-32 pb-10 md:pb-12">
      <div className="container relative">
        <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-8 md:gap-12 items-center">
          <div className="relative z-10">
            <SectionFade>
              <p className="font-hand text-3xl md:text-4xl text-blue-pop mb-4">Educación financiera accesible</p>
              <h2 className="max-w-3xl text-[2.25rem] sm:text-5xl md:text-6xl lg:text-[4.35rem] font-black leading-[0.95] sm:leading-[0.92] tracking-normal text-foreground mb-6 md:mb-7">
                Aprendé a analizar empresas e invertir con criterio propio, <strong className="font-black">gratis.</strong>
              </h2>
            </SectionFade>
            <SectionFade delay={0.1}>
              <p className="text-base md:text-lg text-foreground/70 max-w-xl mb-8">
                {curriculumClassCount} clases presenciales de análisis fundamental para estudiantes en Uruguay. Sin costos. Sin trading. Sin experiencia previa.
              </p>
            </SectionFade>
            <SectionFade delay={0.12}>
              <div className="mb-8 max-w-md">
                <LiveStudentCounter />
              </div>
            </SectionFade>
            <SectionFade delay={0.15}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button asChild variant="cta" size="cta" className="w-full sm:w-auto">
                  <Link to={isLoggedIn ? "/dashboard" : "/auth?mode=signup"}>
                    {isLoggedIn ? "Ir al dashboard" : "Inscribite ahora"}
                    <ArrowRight size={17} />
                  </Link>
                </Button>
                <Link to="/programa" className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-pop px-8 py-3 text-sm font-heading font-bold text-white shadow-[0_8px_0_rgba(0,0,0,0.12)] transition-colors hover:bg-blue-pop/90 sm:w-fit">
                  Ver programa
                  <ArrowRight size={17} />
                </Link>
              </div>
              <p className="mt-4 max-w-xl text-xs leading-relaxed text-foreground/55">
                Al continuar aceptás nuestros {" "}
                <Link to="/terminos" className="underline underline-offset-4 hover:text-foreground transition-colors">
                  términos
                </Link>
                {" "}y la {" "}
                <Link to="/privacidad" className="underline underline-offset-4 hover:text-foreground transition-colors">
                  política de privacidad
                </Link>
                .
              </p>
            </SectionFade>
          </div>

          <SectionFade delay={0.2}>
            <div className="relative min-h-[340px] sm:min-h-[420px] md:min-h-[500px]">
              <div className="absolute inset-x-0 bottom-20 sm:bottom-24 top-auto h-[340px] sm:h-[420px] md:bottom-36 md:h-[500px]">
                <div className="absolute -left-16 -right-20 top-12 h-[90%] rotate-[5deg] rounded-[52%] border border-white/25 bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.62),transparent_18%),linear-gradient(135deg,rgba(255,232,104,0.9),rgba(255,197,0,0.78)_55%,rgba(255,221,84,0.62))] shadow-[inset_0_3px_18px_rgba(255,255,255,0.5),inset_0_-26px_44px_rgba(255,178,0,0.24),0_24px_70px_rgba(255,200,0,0.28)] backdrop-blur-sm" />
                <div className="absolute -right-5 top-2 h-24 w-32 rounded-[50%] border-[14px] border-blue-pop border-l-transparent border-b-transparent rotate-[-22deg]" />
                <DynamicStockTickerAnimation />
                <div className="absolute bottom-0 left-8 rounded-full bg-blue-pop px-6 py-5 text-center text-sm font-heading font-black uppercase leading-tight text-white shadow-xl rotate-[-8deg]">
                  Para estudiantes
                  <br />
                  de Uruguay
                </div>
              </div>
            </div>
          </SectionFade>
        </div>
      </div>

      {showScrollHint && <div className="absolute bottom-5 left-1/2 h-9 w-5 -translate-x-1/2 rounded-full border-2 border-foreground/30" />}
    </section>
  );
};

const ProblemSection = () => (
  <section className="relative overflow-hidden bg-blue-soft py-12 md:py-24">
    <div className="container">
      <div className="grid gap-10 lg:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="font-hand text-3xl text-blue-pop">El problema</p>
          <h2 className="mt-2 max-w-xl text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
            Nadie nos enseña sobre dinero
          </h2>
          <div className="mt-6 space-y-4 text-lg text-foreground/70">
            <p>
              En Uruguay, el sistema educativo no incluye finanzas personales ni inversiones. Los jóvenes llegan a la adultez sin saber leer un estado financiero, evaluar una inversión, o entender cómo funciona el mercado de valores.
            </p>
            <p>No es por falta de interés. Es por falta de acceso.</p>
          </div>
          <div className="mt-8 h-2 w-40 rounded-full bg-blue-pop" />
        </div>
        <div className="relative">
          <div className="absolute -left-8 bottom-10 h-20 w-20 rounded-full bg-sun" />
          <div className="relative rounded-[2rem] border-2 border-foreground bg-card p-8 shadow-[10px_10px_0_#ffc800]">
            <span className="block font-heading text-3xl sm:text-4xl md:text-5xl font-black text-foreground">Educación antes que especulación</span>
            <p className="mt-3 max-w-md text-lg text-foreground/70">
              En Foro Agora no damos señales ni promesas de retorno: enseñamos fundamentos para que cada estudiante decida con criterio propio.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ValueProp = () => (
  <section className="relative bg-background py-12 md:py-24">
    <div className="container">
      <div className="grid gap-10 lg:gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="font-hand text-3xl text-blue-pop">Qué enseñamos</p>
          <h2 className="mt-2 max-w-lg text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
            Habilidades financieras reales, no atajos
          </h2>
          <p className="mt-5 text-lg text-foreground/70">
            No enseñamos trading. Enseñamos a pensar como inversores: a leer estados financieros, evaluar empresas, y tomar decisiones con criterio propio.
          </p>
          <Button asChild variant="cta-outline" size="cta" className="mt-8">
            <Link to="/programa">
              Ver programa completo
              <ArrowRight size={17} />
            </Link>
          </Button>
        </div>

        <div className="grid gap-px overflow-hidden rounded-[1.5rem] border border-border bg-border sm:grid-cols-2 md:grid-cols-3">
          {[
            {
              num: "01",
              title: "Análisis fundamental",
              desc: "Aprendé a leer los estados financieros de cualquier empresa del mundo.",
            },
            {
              num: "02",
              title: "Valoración de empresas",
              desc: "Entendé si una acción está cara o barata, con criterio propio.",
            },
            {
              num: "03",
              title: "Decisiones inteligentes",
              desc: "Evaluá oportunidades de inversión con la misma metodología que los profesionales.",
            },
          ].map((item) => (
            <div key={item.num} className="bg-card p-7">
              <span className="font-hand text-4xl text-orange-pop">{item.num}</span>
              <h3 className="mt-3 font-heading text-xl font-black">{item.title}</h3>
              <p className="mt-3 text-sm text-foreground/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const FirstClassVideo = () => {
  return (
    <section className="relative overflow-hidden bg-background py-12 md:py-24" aria-labelledby="first-class-heading">
      <div className="container">
        <SectionFade>
          <FirstClassVideoCard />
        </SectionFade>
      </div>
    </section>
  );
};

const OurValues = () => (
  <section className="relative py-12 md:py-24 overflow-hidden bg-background">
    <div className="container">
      <SectionFade>
        <p className="font-hand text-3xl text-orange-pop">Nuestros principios</p>
        <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
          Educamos hoy para transformar el mañana
        </h2>
        <p className="text-foreground/70 text-base md:text-lg max-w-2xl mt-4 mb-10 md:mb-12">
          Cada decisión que tomamos está guiada por nuestros valores fundamentales, que reflejan nuestro compromiso con la educación de calidad y el impacto real.
        </p>
      </SectionFade>

      <SectionFade delay={0.1}>
        <CoreValues />
      </SectionFade>
    </div>
  </section>
);

const HowItWorks = () => (
  <section className="py-12 md:py-24 bg-background">
    <div className="container">
      <div className="grid gap-8 lg:gap-10 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="font-hand text-3xl text-blue-pop">Cómo funciona</p>
          <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-black">Cuatro pasos</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { step: "01", title: "Inscribite", desc: "Completá el formulario de inscripción en 2 minutos." },
            { step: "02", title: "Asistí", desc: "Vení a clases presenciales en Montevideo." },
            { step: "03", title: "Aprendé", desc: "Accedé a recursos online y nuestra comunidad." },
            { step: "04", title: "Decidí", desc: "Tomá decisiones financieras con criterio propio." },
          ].map((s) => (
            <div key={s.step} className="rounded-[1.25rem] border border-border bg-card p-6 shadow-sm">
              <span className="font-hand text-4xl text-orange-pop">{s.step}</span>
              <h3 className="mt-3 font-heading text-xl font-black">{s.title}</h3>
              <p className="mt-2 text-foreground/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const MovementCTA = () => (
  <section className="relative overflow-hidden border-y border-border bg-card py-12 md:py-20">
    <div className="container">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="font-hand text-3xl text-orange-pop">Hagámoslo crecer</p>
          <h2 className="mt-2 max-w-3xl text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
            Foro Agora puede llegar más lejos si más gente lo comparte.
          </h2>
          <p className="mt-5 max-w-2xl text-base md:text-lg text-foreground/70">
            Si conocés a alguien que quiere aprender educación financiera desde cero, compartile el sitio, el registro o el kit de difusión. Las actividades son abiertas y gratuitas.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="cta" size="cta">
              <Link to="/difundir">
                Quiero difundir Foro Agora
                <ArrowRight size={17} />
              </Link>
            </Button>
            <Button asChild variant="cta-outline" size="cta">
              <Link to="/registro">Inscribirme</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {[
            { title: "Compartir el registro", desc: "Pasale Foro Agora a cualquier joven que quiera aprender desde cero." },
            { title: "Usar mensajes claros", desc: "El kit de difusión tiene textos listos para WhatsApp, historias y LinkedIn." },
            { title: "Redes con propósito", desc: "Difusión clara: educación antes que especulación, siempre gratis." },
          ].map((item) => (
            <div key={item.title} className="rounded-[1.25rem] border border-border bg-background p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-pop text-white">
                <Users size={18} />
              </div>
              <h3 className="font-heading text-lg font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section className="bg-background py-12 md:py-20">
    <div className="container">
      <div className="grid gap-8 lg:gap-10 lg:grid-cols-[0.55fr_1.45fr] lg:items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-black leading-tight">Lo que dicen nuestros estudiantes</h2>
          <div className="mt-3 h-2 w-40 rounded-full bg-sun" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((quote, index) => (
            <blockquote key={quote} className="rounded-[1.25rem] border border-border bg-card p-6 shadow-[0_14px_50px_rgba(0,0,0,0.08)]">
              <span className="font-hand text-5xl leading-none text-blue-pop">“</span>
              <p className="mt-1 text-sm text-foreground/75">{quote}</p>
              <footer className="mt-6 font-heading text-sm font-bold text-foreground">Estudiante {index + 1}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="relative overflow-hidden bg-sun py-12 md:py-20">
    <div className="absolute left-0 top-10 h-24 w-36 rounded-[50%] border-[14px] border-blue-pop border-r-transparent border-b-transparent rotate-[-10deg]" />
    <div className="container relative">
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="max-w-3xl text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
            Sumate a una comunidad que aprende, comparte y transforma.
          </h2>
          <p className="mt-4 text-base md:text-lg text-foreground/75">
            No se necesitan conocimientos previos. Solo ganas de aprender y crecer.
          </p>
        </div>
        <div className="space-y-4 w-full md:w-auto">
          <Button asChild variant="default" size="cta" className="bg-foreground text-background hover:bg-foreground/80 w-full md:w-auto">
            <Link to="/auth?mode=signup">
              Quiero participar
              <ArrowRight size={17} />
            </Link>
          </Button>
          <p className="font-hand text-3xl text-foreground">¡Te esperamos!</p>
        </div>
      </div>
    </div>
  </section>
);

const Index = () => (
  <>
    <LandingEventPopup />
    <Hero />
    <ProblemSection />
    <ValueProp />
    <FirstClassVideo />
    <OurValues />
    <HowItWorks />
    <MovementCTA />
    {/* ⚠️ TESTIMONIALS HIDDEN FOR NOW - DO NOT DELETE ⚠️ Re-enable when we have actual reviews */}
    <PreservedInjuSupportStrip />
    <LandingEventFooter />
    <FinalCTA />
  </>
);

export default Index;
