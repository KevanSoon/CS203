import { BookOpen, FileText, GraduationCap, Bell, TrendingUp } from "lucide-react";

export const StatsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-medium text-muted-foreground mb-1">
          Total Lessons
        </h3>
        <p className="text-2xl font-bold text-foreground">48</p>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-medium text-muted-foreground mb-1">
          Lessons Published
        </h3>
        <p className="text-2xl font-bold text-foreground">32</p>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-medium text-muted-foreground mb-1">
          Completions
        </h3>
        <p className="text-2xl font-bold text-foreground">892</p>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="h-5 w-5 text-primary" />
          </div>
        </div>
        <h3 className="font-medium text-muted-foreground mb-1">Pending Alerts</h3>
        <p className="text-2xl font-bold text-foreground">7</p>
      </div>
    </div>
  );
};
