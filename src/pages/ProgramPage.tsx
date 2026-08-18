import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionFade from "@/components/SectionFade";
import FirstClassVideoCard from "@/components/FirstClassVideoCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { curriculumClasses, curriculumClassCount } from "@/lib/curriculum";
import { ArrowRight } from "lucide-react";

const ProgramPage = () => (
  <>
    <section className="pt-32 md:pt-40 pb-16">
      <div className="container">
        <SectionFade>
          <p className="text-xs font-heading font-medium uppercase tracking-widest text-muted-foreground mb-6">
            El programa
          </p>
          <h1 className="text-3xl md:text-5xl text-foreground max-w-4xl mb-8 leading-tight">
            Un programa diseñado para que entiendas el mercado de verdad
          </h1>
        </SectionFade>
        <SectionFade delay={0.1}>
          <div className="border border-border rounded-lg p-6 md:p-8 max-w-4xl">
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">No enseñamos trading ni especulación.</strong>{" "}
              Enseñamos análisis fundamental: la misma metodología que usan los mejores inversores del mundo.
            </p>
          </div>
        </SectionFade>
      </div>
    </section>

    <section className="py-16 md:py-24 border-y border-border">
      <div className="container max-w-4xl">
        <p className="text-xs font-heading font-medium uppercase tracking-widest text-muted-foreground mb-4">
          Programa de estudio
        </p>
        <h2 className="text-3xl md:text-4xl text-foreground mb-10">
          {curriculumClassCount} clases. Todo lo esencial.
        </h2>
        <div className="mb-14">
          <FirstClassVideoCard />
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {curriculumClasses.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border border-border rounded-lg px-6 overflow-hidden">
              <AccordionTrigger className="text-left font-heading font-semibold text-foreground hover:no-underline py-5">
                Módulo {item.classNumber}: {item.title}
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <p className="text-muted-foreground leading-relaxed mb-4">{item.summary}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {item.topics.map((topic) => (
                    <div key={topic} className="rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">
                      {topic}
                    </div>
                  ))}
                </div>
                <span className="mt-4 block text-xs text-muted-foreground font-heading">{item.duration}</span>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container max-w-4xl">
        <p className="text-xs font-heading font-medium uppercase tracking-widest text-muted-foreground mb-4">
          Formato
        </p>
        <h2 className="text-3xl md:text-4xl text-foreground mb-10">
          Presencial + comunidad online
        </h2>
        <div className="grid md:grid-cols-2 gap-px bg-border rounded-lg overflow-hidden">
          <div className="bg-background p-8">
            <h3 className="font-heading font-semibold text-foreground text-lg">Clases presenciales</h3>
          </div>
          <div className="bg-background p-8">
            <h3 className="font-heading font-semibold text-foreground text-lg">Recursos online</h3>
          </div>
        </div>
      </div>
    </section>

    <section className="py-16 md:py-24 border-y border-border">
      <div className="container max-w-4xl">
        <p className="text-xs font-heading font-medium uppercase tracking-widest text-muted-foreground mb-4">
          ¿Es para vos?
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border-l border-foreground pl-6">
            <h3 className="font-heading font-semibold text-foreground text-lg mb-3">Ideal si sos...</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>Estudiante de liceo (15–18 años)</li>
              <li>Curioso/a sobre inversiones</li>
              <li>Alguien sin experiencia previa</li>
              <li>De Montevideo o alrededores</li>
            </ul>
          </div>
          <div className="border-l border-border pl-6">
            <h3 className="font-heading font-semibold text-foreground text-lg mb-3">También si sos...</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>Estudiante universitario/a</li>
              <li>Joven profesional (18–25)</li>
              <li>Alguien que quiere entender finanzas</li>
              <li>De otro departamento (recursos online)</li>
            </ul>
          </div>
          <div className="border-l border-border pl-6">
            <h3 className="font-heading font-semibold text-foreground text-lg mb-3">No es para vos si...</h3>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>Buscás tips de trading</li>
              <li>Querés "hacerte rico rápido"</li>
              <li>Esperás señales de compra/venta</li>
              <li>Te interesa cripto o especulación</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="container">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-5xl text-foreground mb-6 leading-tight">
            ¿Listo para aprender a invertir?
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Tu lugar te está esperando.
          </p>
          <Button asChild variant="cta" size="cta">
            <Link to="/registro">Inscribite <ArrowRight size={16} /></Link>
          </Button>
        </div>
      </div>
    </section>
  </>
);

export default ProgramPage;
