import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const firstClassFallback = {
  title: "Clase 1 ForoAgora: Módulo 1 y 2",
  youtubeUrl: "https://www.youtube.com/watch?v=1Kb6WHHJ1n4",
};

const extractYouTubeVideoId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
  return match?.[1] || null;
};

const FirstClassVideoCard = () => {
  const [firstClass, setFirstClass] = useState(firstClassFallback);

  useEffect(() => {
    let active = true;

    const loadFirstClass = async () => {
      const { data } = await supabase
        .from("content_items")
        .select("title, youtube_url")
        .eq("is_published", true)
        .eq("type", "video")
        .not("youtube_url", "is", null)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (active && data?.youtube_url) {
        setFirstClass({ title: data.title, youtubeUrl: data.youtube_url });
      }
    };

    void loadFirstClass();
    return () => {
      active = false;
    };
  }, []);

  const videoId = extractYouTubeVideoId(firstClass.youtubeUrl) || extractYouTubeVideoId(firstClassFallback.youtubeUrl);

  return (
    <div className="relative overflow-hidden rounded-[2rem] border-2 border-foreground bg-blue-soft shadow-[8px_8px_0_#ffc800] md:shadow-[12px_12px_0_#ffc800]">
      <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-blue-pop/10" aria-hidden="true" />
      <div className="absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-orange-pop/10" aria-hidden="true" />

      <div className="relative grid gap-7 p-6 sm:p-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-10 lg:p-10">
        <div>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-orange-pop text-white shadow-sm">
            <Play size={21} fill="currentColor" aria-hidden="true" />
          </div>
          <p className="font-hand text-3xl text-blue-pop">Clase abierta</p>
          <h2 id="first-class-heading" className="mt-2 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            Mirá nuestra primera clase, gratis acá:
          </h2>
          <p className="mt-5 text-base font-semibold text-foreground/70">{firstClass.title}</p>
          <Button asChild variant="cta-outline" size="cta" className="mt-7 bg-background/80">
            <Link to="/recursos">
              Ver todos los recursos
              <ArrowRight size={17} />
            </Link>
          </Button>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border-2 border-foreground bg-foreground p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
          <div className="aspect-video overflow-hidden rounded-[1.15rem] bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title={firstClass.title}
              className="h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstClassVideoCard;
