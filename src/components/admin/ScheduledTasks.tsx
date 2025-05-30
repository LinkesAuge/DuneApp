import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Clock, Calendar, Trash2, RefreshCw, Plus, Hexagon } from 'lucide-react';
import { ScheduledAdminTask } from '../../types/admin';

interface ScheduledTasksProps {
  scheduledTasks: ScheduledAdminTask[];
  isLoading: boolean;
  error: string | null;
  onRefreshTasks: () => void;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

type ScheduleType = 'minutes' | 'daily' | 'weekly' | 'monthly' | 'custom';

const weekDays = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' } // cron uses 0 for Sunday
];

const ScheduledTasks: React.FC<ScheduledTasksProps> = ({
  scheduledTasks,
  isLoading,
  error,
  onRefreshTasks,
  onError,
  onSuccess
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState<number | null>(null);
  
  // Form state
  const [taskName, setTaskName] = useState('');
  const [edgeFunction, setEdgeFunction] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [minutesInterval, setMinutesInterval] = useState(30);
  const [dailyTime, setDailyTime] = useState('02:00');
  const [weeklyDay, setWeeklyDay] = useState(1);
  const [weeklyTime, setWeeklyTime] = useState('02:00');
  const [monthlyDay, setMonthlyDay] = useState(1);
  const [monthlyTime, setMonthlyTime] = useState('02:00');
  const [customCron, setCustomCron] = useState('0 2 * * *');

  const availableFunctions = [
    { value: 'perform-map-backup', label: 'Map Backup' },
    { value: 'perform-map-reset', label: 'Map Reset' },
  ];

  const generateCronExpression = (): string => {
    switch (scheduleType) {
      case 'minutes':
        return `*/${minutesInterval} * * * *`;
      case 'daily': {
        const [hours, minutes] = dailyTime.split(':');
        return `${minutes} ${hours} * * *`;
      }
      case 'weekly': {
        const [hours, minutes] = weeklyTime.split(':');
        return `${minutes} ${hours} * * ${weeklyDay}`;
      }
      case 'monthly': {
        const [hours, minutes] = monthlyTime.split(':');
        return `${minutes} ${hours} ${monthlyDay} * *`;
      }
      case 'custom':
        return customCron;
      default:
        return '0 2 * * *';
    }
  };

  const getScheduleDescription = (cronExpression: string): string => {
    const parts = cronExpression.split(' ');
    if (parts.length === 5) {
      const [min, hour, day, month, dow] = parts;
      
      if (min.startsWith('*/')) {
        return `Every ${min.slice(2)} minutes`;
      }
      
      if (day === '*' && month === '*' && dow === '*') {
        return `Daily at ${hour.padStart(2, '0')}:${min.padStart(2, '0')} (Berlin Time)`;
      }
      
      if (day === '*' && month === '*' && dow !== '*') {
        const dayName = weekDays.find(d => d.value.toString() === dow)?.label || `Day ${dow}`;
        return `Weekly on ${dayName} at ${hour.padStart(2, '0')}:${min.padStart(2, '0')} (Berlin Time)`;
      }
      
      if (day !== '*' && month === '*' && dow === '*') {
        return `Monthly on day ${day} at ${hour.padStart(2, '0')}:${min.padStart(2, '0')} (Berlin Time)`;
      }
    }
    
    return `Custom: ${cronExpression}`;
  };

  const formatNextRunTime = (nextRun: string): string => {
    try {
      const date = new Date(nextRun);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      // Convert to Berlin time
      const berlinTime = new Intl.DateTimeFormat('de-DE', {
        timeZone: 'Europe/Berlin',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
      
      return `${berlinTime} (Berlin Time)`;
    } catch {
      return 'Unknown';
    }
  };

  const handleCreateTask = async () => {
    if (!taskName.trim() || !edgeFunction.trim()) {
      onError('Please fill in all required fields');
      return;
    }

    try {
      const cronExpression = generateCronExpression();
      
      const { data, error } = await supabase.functions.invoke('schedule-admin-task', {
        body: {
          taskName: taskName.trim(),
          edgeFunction: edgeFunction.trim(),
          cronExpression
        }
      });

      if (error) throw error;

      if (data?.success) {
        onSuccess(`Task "${taskName}" scheduled successfully`);
        resetForm();
        onRefreshTasks();
      } else {
        throw new Error(data?.error || 'Failed to schedule task');
      }
    } catch (error: any) {
      console.error('Error scheduling task:', error);
      onError('Failed to schedule task: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this scheduled task?')) {
      return;
    }

    setIsDeletingTask(taskId);
    try {
      const { data, error } = await supabase.functions.invoke('delete-scheduled-admin-task', {
        body: { taskId }
      });

      if (error) throw error;

      if (data?.success) {
        onSuccess('Task deleted successfully');
        onRefreshTasks();
      } else {
        throw new Error(data?.error || 'Failed to delete task');
      }
    } catch (error: any) {
      console.error('Error deleting task:', error);
      onError('Failed to delete task: ' + (error.message || 'Unknown error'));
    } finally {
      setIsDeletingTask(null);
    }
  };

  const resetForm = () => {
    setTaskName('');
    setEdgeFunction('');
    setScheduleType('daily');
    setMinutesInterval(30);
    setDailyTime('02:00');
    setWeeklyDay(1);
    setWeeklyTime('02:00');
    setMonthlyDay(1);
    setMonthlyTime('02:00');
    setCustomCron('0 2 * * *');
    setIsAddingTask(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full border border-gold-300/50 mb-6"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
            <Clock className="text-gold-300" size={24} />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-300 mx-auto mb-4"></div>
          <p className="text-gold-300 font-light tracking-wide"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Loading scheduled tasks...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-light tracking-[0.15em] text-gold-300 flex items-center"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          <Clock className="mr-4 text-amber-200" size={28} />
          S C H E D U L E D  T A S K S
          <span className="ml-4 text-lg text-amber-200/70">({scheduledTasks.length} active)</span>
        </h3>
        {!isAddingTask && (
          <button
            onClick={() => setIsAddingTask(true)}
            className="text-gold-300 hover:text-amber-200 transition-all duration-300 p-2 rounded-md border border-gold-300/30 hover:border-amber-200/40 hover:bg-amber-200/10 flex items-center"
          >
            <Plus size={18} className="mr-2" />
            <span className="text-sm font-light tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Add Task
            </span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-red-400/40"
             style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <p className="text-red-300 font-light"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            {error}
          </p>
        </div>
      )}

      {/* Add Task Form */}
      {isAddingTask && (
        <div className="relative p-6 rounded-lg border border-gold-300/40 backdrop-blur-md"
             style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
          <h4 className="text-lg font-light text-gold-300 mb-6 flex items-center tracking-[0.1em]"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            <Hexagon className="mr-3 text-amber-200" size={20} />
            C R E A T E  S C H E D U L E D  T A S K
          </h4>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Task Name *
                </label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                           text-amber-200 placeholder-amber-200/40 backdrop-blur-sm
                           focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                           transition-all duration-300"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  placeholder="e.g., Daily Map Backup"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Function *
                </label>
                <select
                  value={edgeFunction}
                  onChange={(e) => setEdgeFunction(e.target.value)}
                  className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                           text-amber-200 backdrop-blur-sm
                           focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                           transition-all duration-300"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  <option value="">Select a function...</option>
                  {availableFunctions.map((func) => (
                    <option key={func.value} value={func.value}>
                      {func.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Schedule Type */}
            <div>
              <label className="block text-sm font-medium text-gold-300 mb-3 tracking-wide"
                     style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Schedule Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { value: 'minutes', label: 'Every X Minutes' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'custom', label: 'Custom' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setScheduleType(option.value as ScheduleType)}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      scheduleType === option.value
                        ? 'bg-gold-300/20 border-gold-300/60 text-gold-300'
                        : 'bg-void-950/40 border-gold-300/20 text-amber-200/70 hover:border-gold-300/40 hover:text-amber-200'
                    }`}
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Configuration */}
            <div className="space-y-4">
              {scheduleType === 'minutes' && (
                <div>
                  <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Run every {minutesInterval} minutes
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-amber-200/60 text-sm">5 min</span>
                    <input
                      type="range"
                      min="5"
                      max="240"
                      step="5"
                      value={minutesInterval}
                      onChange={(e) => setMinutesInterval(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-void-950/60 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, rgb(251 191 36) 0%, rgb(251 191 36) ${((minutesInterval - 5) / 235) * 100}%, rgba(42, 36, 56, 0.6) ${((minutesInterval - 5) / 235) * 100}%, rgba(42, 36, 56, 0.6) 100%)`
                      }}
                    />
                    <span className="text-amber-200/60 text-sm">240 min</span>
                  </div>
                </div>
              )}

              {scheduleType === 'daily' && (
                <div>
                  <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Daily at (Berlin Time)
                  </label>
                  <input
                    type="time"
                    value={dailyTime}
                    onChange={(e) => setDailyTime(e.target.value)}
                    className="px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                             text-amber-200 backdrop-blur-sm
                             focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                             transition-all duration-300"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                  />
                </div>
              )}

              {scheduleType === 'weekly' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                           style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      Day of Week
                    </label>
                    <select
                      value={weeklyDay}
                      onChange={(e) => setWeeklyDay(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                               text-amber-200 backdrop-blur-sm
                               focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                               transition-all duration-300"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    >
                      {weekDays.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                           style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      Time (Berlin Time)
                    </label>
                    <input
                      type="time"
                      value={weeklyTime}
                      onChange={(e) => setWeeklyTime(e.target.value)}
                      className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                               text-amber-200 backdrop-blur-sm
                               focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                               transition-all duration-300"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    />
                  </div>
                </div>
              )}

              {scheduleType === 'monthly' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                           style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      Day of Month
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={monthlyDay}
                      onChange={(e) => setMonthlyDay(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                               text-amber-200 backdrop-blur-sm
                               focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                               transition-all duration-300"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                           style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                      Time (Berlin Time)
                    </label>
                    <input
                      type="time"
                      value={monthlyTime}
                      onChange={(e) => setMonthlyTime(e.target.value)}
                      className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                               text-amber-200 backdrop-blur-sm
                               focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                               transition-all duration-300"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    />
                  </div>
                </div>
              )}

              {scheduleType === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                         style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    Cron Expression
                  </label>
                  <input
                    type="text"
                    value={customCron}
                    onChange={(e) => setCustomCron(e.target.value)}
                    className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                             text-amber-200 placeholder-amber-200/40 backdrop-blur-sm
                             focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                             transition-all duration-300"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    placeholder="e.g., 0 2 * * *"
                  />
                  <p className="text-amber-200/60 text-xs mt-2 font-light">
                    Format: minute hour day month day-of-week
                  </p>
                </div>
              )}

              {/* Schedule Preview */}
              <div className="p-4 rounded-lg border border-amber-200/30"
                   style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                <div className="text-amber-200 font-medium text-sm mb-1"
                     style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Schedule Preview:
                </div>
                <div className="text-amber-200/80 text-sm font-light">
                  {getScheduleDescription(generateCronExpression())}
                </div>
                <div className="text-amber-200/60 text-xs mt-1 font-light">
                  Cron: {generateCronExpression()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gold-300/20">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-amber-200/70 hover:text-amber-200 transition-all duration-300 
                         border border-amber-200/30 hover:border-amber-200/50 rounded-md font-light tracking-wide
                         hover:bg-amber-200/5"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateTask}
                disabled={!taskName.trim() || !edgeFunction.trim()}
                className="px-6 py-3 bg-gold-300/90 hover:bg-gold-300 text-void-950 font-medium rounded-md 
                         transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                <Clock size={16} className="mr-2" />
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Tasks */}
      <div className="relative rounded-lg border border-gold-300/30 backdrop-blur-md"
           style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
        <div className="p-4 border-b border-gold-300/20"
             style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-light text-gold-300 tracking-[0.1em] flex items-center"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              <Calendar className="mr-3 text-amber-200" size={20} />
              A C T I V E  T A S K S
            </h4>
            <button
              onClick={onRefreshTasks}
              className="text-amber-200/70 hover:text-amber-200 transition-all duration-300 p-2 rounded-md border border-amber-200/30 hover:border-amber-200/40 hover:bg-amber-200/10"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {scheduledTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-block p-3 rounded-full border border-amber-200/50 mb-3"
                   style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
                <Clock className="text-amber-200" size={20} />
              </div>
              <p className="text-amber-200/70 font-light"
                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                No scheduled tasks configured
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledTasks.map((task) => (
                <div key={task.id} className="p-4 rounded-lg border border-gold-300/20 hover:border-gold-300/40 transition-all duration-300 group"
                     style={{ backgroundColor: 'rgba(42, 36, 56, 0.4)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded border border-gold-300/30 flex items-center justify-center"
                             style={{ backgroundColor: 'rgba(251, 191, 36, 0.2)' }}>
                          <Clock className="text-gold-300" size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-amber-200 font-medium text-sm"
                               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                            {task.name}
                          </div>
                          <div className="text-amber-200/60 text-xs font-light">
                            Function: {task.edge_function}
                          </div>
                          <div className="text-amber-200/60 text-xs font-light">
                            Schedule: {getScheduleDescription(task.cron_expression)}
                          </div>
                          {task.next_run && (
                            <div className="text-amber-200/60 text-xs font-light">
                              Next run: {formatNextRunTime(task.next_run)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={isDeletingTask === task.id}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      title="Delete task"
                    >
                      {isDeletingTask === task.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduledTasks; 