type LessonCardProps = {
  image: string;
  title: string;
  description: string;
  progress: number;
};

export default function LessonCard({
  image,
  title,
  description,
  progress,
}: LessonCardProps) {
  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition">
      <img
        src={image}
        alt={title}
        className="w-full h-40 object-cover"
      />

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground">
            <span>Completion</span>
            <span>{progress}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
