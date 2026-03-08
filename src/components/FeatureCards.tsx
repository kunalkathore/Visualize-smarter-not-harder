import { Upload, BarChart2, Download } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload Data",
    description: "Drag & drop CSV, Excel, or JSON files. We parse it instantly so you can focus on insights.",
  },
  {
    icon: BarChart2,
    title: "Choose Chart",
    description: "Pick from bar, line, pie, heatmap, and more — with smart defaults that look great out of the box.",
  },
  {
    icon: Download,
    title: "Export Visual",
    description: "Download high-res PNG, SVG, or PDF exports ready for presentations, reports, or social media.",
  },
];

const FeatureCards = () => {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
          Three steps to stunning visuals
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center font-body text-muted-foreground">
          No code, no design skills — just your data and a few clicks.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-card p-8 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 animate-fade-up"
              style={{ animationDelay: `${0.1 * (i + 1)}s` }}
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 font-body text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
