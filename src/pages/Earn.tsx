import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, Video, Trophy, Heart, Share2, CheckCircle2, Coins } from "lucide-react";
import { mockTasks, useDreamStore } from "@/lib/store";

const iconMap: Record<string, React.ElementType> = {
  play: Play,
  video: Video,
  trophy: Trophy,
  heart: Heart,
  share: Share2,
};

export default function Earn() {
  const [tasks, setTasks] = useState(mockTasks);
  const addEarning = useDreamStore((state) => state.addEarning);
  const todayEarnings = useDreamStore((state) => state.todayEarnings);
  const dailyLimit = useDreamStore((state) => state.dailyLimit);

  const completeTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === "completed") return;

    // Simulate task completion
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: "completed" as const } : t
      )
    );

    addEarning({
      type: "engage",
      amount: task.amount,
      description: task.title,
    });
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalPossible = tasks.reduce((acc, t) => acc + t.amount, 0);

  return (
    <MobileLayout>
      <div className="px-4 py-6 safe-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            Earn More
          </h1>
          <p className="text-muted-foreground text-sm">
            Complete tasks to boost your earnings
          </p>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="earning" className="mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Earnings</p>
                    <p className="text-2xl font-bold text-gradient-gold">₦{todayEarnings}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Daily Limit</p>
                  <p className="text-lg font-semibold text-foreground">₦{dailyLimit}</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(todayEarnings / dailyLimit) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="h-full bg-gradient-gold rounded-full"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {completedCount}/{tasks.length} tasks completed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Available Tasks
          </h2>
          
          {tasks.map((task, index) => {
            const Icon = iconMap[task.icon] || Play;
            const isCompleted = task.status === "completed";

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card variant={isCompleted ? "default" : "gradient"} className={isCompleted ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isCompleted ? "bg-success/20" : "bg-primary/20"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-success" />
                        ) : (
                          <Icon className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-lg font-bold ${isCompleted ? "text-success" : "text-gradient-gold"}`}>
                          ₦{task.amount}
                        </span>
                        {!isCompleted && (
                          <Button
                            variant="gold"
                            size="sm"
                            onClick={() => completeTask(task.id)}
                            disabled={todayEarnings >= dailyLimit}
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Potential earnings note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Complete all tasks to earn up to <span className="text-primary font-semibold">₦{totalPossible}</span> today
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
}
