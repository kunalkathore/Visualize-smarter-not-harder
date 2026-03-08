import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area,
} from "recharts";

const barData = [
  { name: "Jan", value: 40 }, { name: "Feb", value: 65 }, { name: "Mar", value: 50 },
  { name: "Apr", value: 80 }, { name: "May", value: 55 }, { name: "Jun", value: 90 },
];

const pieData = [
  { name: "Desktop", value: 45 }, { name: "Mobile", value: 30 },
  { name: "Tablet", value: 15 }, { name: "Other", value: 10 },
];
const pieColors = ["hsl(250,70%,56%)", "hsl(170,60%,45%)", "hsl(32,95%,55%)", "hsl(340,65%,55%)"];

const lineData = [
  { name: "W1", a: 20, b: 30 }, { name: "W2", a: 35, b: 25 },
  { name: "W3", a: 28, b: 40 }, { name: "W4", a: 50, b: 35 },
  { name: "W5", a: 45, b: 55 }, { name: "W6", a: 60, b: 48 },
];

const areaData = [
  { name: "Q1", value: 30 }, { name: "Q2", value: 55 },
  { name: "Q3", value: 45 }, { name: "Q4", value: 70 },
  { name: "Q5", value: 60 }, { name: "Q6", value: 85 },
];

const heatData = Array.from({ length: 24 }, (_, i) => ({
  name: `${i}`,
  value: Math.round(20 + Math.random() * 80),
}));

const scatterLikeBar = [
  { name: "A", v1: 30, v2: 50 }, { name: "B", v1: 60, v2: 35 },
  { name: "C", v1: 45, v2: 70 }, { name: "D", v1: 80, v2: 55 },
  { name: "E", v1: 50, v2: 65 },
];

const charts = [
  {
    title: "Bar Chart",
    subtitle: "Monthly Revenue",
    chart: (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
          <Tooltip />
          <Bar dataKey="value" fill="hsl(250,70%,56%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
  {
    title: "Pie Chart",
    subtitle: "Device Breakdown",
    chart: (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" strokeWidth={2}>
            {pieData.map((_, i) => (
              <Cell key={i} fill={pieColors[i]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    ),
  },
  {
    title: "Line Chart",
    subtitle: "Weekly Comparison",
    chart: (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={lineData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
          <Tooltip />
          <Line type="monotone" dataKey="a" stroke="hsl(250,70%,56%)" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="b" stroke="hsl(170,60%,45%)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    ),
  },
  {
    title: "Area Chart",
    subtitle: "Growth Trend",
    chart: (
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={areaData}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(170,60%,45%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(170,60%,45%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="hsl(170,60%,45%)" fill="url(#areaGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    ),
  },
  {
    title: "Heatmap Style",
    subtitle: "Hourly Activity",
    chart: (
      <div className="grid grid-cols-6 gap-1 px-2">
        {heatData.slice(0, 24).map((d, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm"
            style={{
              backgroundColor: `hsl(250, 70%, ${90 - d.value * 0.5}%)`,
            }}
            title={`Hour ${i}: ${d.value}`}
          />
        ))}
      </div>
    ),
  },
  {
    title: "Grouped Bar",
    subtitle: "Category Comparison",
    chart: (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={scatterLikeBar}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(220,10%,46%)" />
          <Tooltip />
          <Bar dataKey="v1" fill="hsl(250,70%,56%)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="v2" fill="hsl(32,95%,55%)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
];

const SampleGallery = () => {
  return (
    <section className="px-4 py-16 md:py-24 bg-muted/40">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
          Sample Chart Gallery
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center font-body text-muted-foreground">
          Get inspired by these chart types — all generated from simple data uploads.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {charts.map((c, i) => (
            <div
              key={c.title}
              className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md animate-fade-up"
              style={{ animationDelay: `${0.08 * (i + 1)}s` }}
            >
              <h3 className="font-display text-base font-semibold text-foreground">{c.title}</h3>
              <p className="mb-4 font-body text-sm text-muted-foreground">{c.subtitle}</p>
              {c.chart}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SampleGallery;
