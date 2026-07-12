"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";

// Import custom sub-views
import { AutomationDashboard } from "@/components/automation/AutomationDashboard";
import { WorkflowList } from "@/components/automation/WorkflowList";
import { WorkflowBuilder } from "@/components/automation/WorkflowBuilder";
import { TemplatesGallery } from "@/components/automation/TemplatesGallery";
import { ExecutionCenter } from "@/components/automation/ExecutionCenter";
import { CronScheduler } from "@/components/automation/CronScheduler";
import { VariableManager } from "@/components/automation/VariableManager";
import { WebhooksManager } from "@/components/automation/WebhooksManager";
import { CreateWorkflowWizard } from "@/components/automation/CreateWorkflowWizard";

// Mock schemas definitions
interface Workflow {
  id: string | number;
  name: string;
  status: "Running" | "Paused" | "Failed" | "Scheduled" | "Draft";
  runsCount: number;
  successRate: string;
  lastRun: string;
  nextRun?: string;
  category: string;
  owner: string;
  tags: string[];
}

interface Execution {
  id: number;
  workflowName: string;
  status: "Success" | "Failed" | "Running";
  started: string;
  finished: string;
  duration: string;
  triggeredBy: string;
}

interface Variable {
  id: string | number;
  key: string;
  type: "String" | "Number" | "Boolean" | "JSON" | "Secret";
  scope: "Workflow" | "Project" | "Employee" | "System" | "AI";
  defaultValue: string;
  required: boolean;
}

interface Webhook {
  id: string | number;
  url: string;
  method: "POST" | "GET" | "PUT";
  status: "Active" | "Inactive";
  workflowName: string;
  created: string;
}

interface Schedule {
  id: string | number;
  workflowName: string;
  cron: string;
  timezone: string;
  status: "Active" | "Paused";
  nextRun: string;
  lastRun: string;
  successRate: string;
}

export default function AutomationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "dashboard";

  // Modal Stepper Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Core visual state database
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | number>("");
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  // Helper status maps
  const mapStatusFromBackend = (status: string): Workflow["status"] => {
    if (status === "active") return "Running";
    if (status === "paused") return "Paused";
    if (status === "draft") return "Draft";
    return "Running";
  };

  // API Ingestors
  const fetchWorkflows = useCallback(() => {
    apiClient.workflows.list()
      .then((res) => {
        if (res.data) {
          const list = res.data.map((w: any) => ({
            id: w.id,
            name: w.name,
            status: mapStatusFromBackend(w.status),
            runsCount: w.runs_count || 0,
            successRate: w.success_rate || "100%",
            lastRun: w.updated_at ? new Date(w.updated_at).toLocaleDateString() : "Recently",
            nextRun: w.status === "active" ? "Scheduled" : "--",
            category: w.category || "General",
            owner: w.owner_details?.full_name || w.owner || "Team Member",
            tags: w.tags_details?.map((t: any) => t.name) || []
          }));
          setWorkflows(list);
          if (!activeWorkflowId && list.length > 0) {
            setActiveWorkflowId(list[0].id);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load workflows from API:", err);
        setWorkflows([]);
      });
  }, [activeWorkflowId]);

  const fetchExecutions = useCallback(() => {
    apiClient.executions.list()
      .then((res) => {
        if (res.data) {
          setExecutions(res.data.map((e: any) => ({
            id: e.id,
            workflowName: e.workflow_name || "Automation Run",
            status: e.status === "success" ? "Success" : e.status === "failed" ? "Failed" : "Running",
            started: e.created_at ? new Date(e.created_at).toLocaleTimeString() : "Just now",
            finished: e.completed_at ? new Date(e.completed_at).toLocaleTimeString() : "--",
            duration: e.duration_ms ? `${e.duration_ms}ms` : "640ms",
            triggeredBy: e.trigger_node_name || "Webhook/API"
          })));
        }
      })
      .catch((err) => {
        console.error("Failed to load executions:", err);
        setExecutions([]);
      });
  }, []);

  const fetchVariables = useCallback(() => {
    apiClient.variables.list()
      .then((res) => {
        if (res.data) {
          setVariables(res.data.map((v: any) => ({
            id: v.id,
            key: v.name,
            type: v.value_type || "String",
            scope: v.scope || "Workflow",
            defaultValue: v.value,
            required: v.is_required || false
          })));
        }
      })
      .catch((err) => {
        console.error("Failed to load variables:", err);
        setVariables([]);
      });
  }, []);

  const fetchWebhooks = useCallback(() => {
    apiClient.webhooks.list()
      .then((res) => {
        if (res.data) {
          setWebhooks(res.data.map((w: any) => ({
            id: w.id,
            url: w.url || `/api/v1/webhooks/incoming/${w.webhook_token}/`,
            method: "POST",
            status: w.is_active ? "Active" : "Inactive",
            workflowName: w.workflow_name || "Flow Webhook",
            created: w.created_at ? new Date(w.created_at).toLocaleDateString() : "Just now"
          })));
        }
      })
      .catch((err) => {
        console.error("Failed to load webhooks:", err);
        setWebhooks([]);
      });
  }, []);

  const fetchSchedules = useCallback(() => {
    apiClient.scheduler.list()
      .then((res) => {
        if (res.data) {
          setSchedules(res.data.map((s: any) => ({
            id: s.id,
            workflowName: s.workflow_name || "Cron Scheduler",
            cron: s.cron_expression || "Daily",
            timezone: "UTC",
            status: s.is_active ? "Active" : "Paused",
            nextRun: s.next_run_at ? new Date(s.next_run_at).toLocaleTimeString() : "--",
            lastRun: s.last_run_at ? new Date(s.last_run_at).toLocaleTimeString() : "Never",
            successRate: "100%"
          })));
        }
      })
      .catch((err) => {
        console.error("Failed to load schedules:", err);
        setSchedules([]);
      });
  }, []);

  const fetchTemplates = useCallback(() => {
    apiClient.templates.list()
      .then((res) => {
        if (res.data) {
          setTemplates(res.data.map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description || "",
            category_name: t.category_name || "General",
            downloads_count: t.downloads_count || 0,
            rating_score: t.rating_score || 5.0
          })));
        }
      })
      .catch((err) => {
        console.error("Failed to load templates:", err);
        setTemplates([]);
      });
  }, []);

  // Ingest lifecycle
  useEffect(() => {
    fetchWorkflows();
    fetchExecutions();
    fetchVariables();
    fetchWebhooks();
    fetchSchedules();
    fetchTemplates();
  }, [fetchWorkflows, fetchExecutions, fetchVariables, fetchWebhooks, fetchSchedules, fetchTemplates]);

  // Tab change handler
  const handleTabChange = (tab: string) => {
    router.push(`/automations?tab=${tab}`);
  };

  // Actions modifiers
  const handleCreateWorkflow = (wizardData: any) => {
    apiClient.workflows.create({
      name: wizardData.name,
      description: wizardData.description || "",
      category: wizardData.category || "General",
      folder: wizardData.folder || "Root",
      status: "draft"
    })
    .then((res) => {
      const w = res.data;
      const newWf: Workflow = {
        id: w.id,
        name: w.name,
        status: "Draft",
        runsCount: 0,
        successRate: "100%",
        lastRun: "Never",
        category: w.category || "General",
        owner: w.owner || "Santhosh",
        tags: wizardData.tags || []
      };

      setWorkflows(prev => [newWf, ...prev]);
      setActiveWorkflowId(newWf.id);

      // Create Webhook trigger if chosen
      if (wizardData.triggerType === "Webhook") {
        apiClient.webhooks.create({
          workflow: w.id,
          is_active: true
        }).then(() => fetchWebhooks());
      }

      // Create Schedule trigger if chosen
      if (wizardData.triggerType === "Schedule") {
        apiClient.scheduler.create({
          workflow: w.id,
          schedule_type: "daily",
          cron_expression: "0 9 * * *",
          is_active: true
        }).then(() => fetchSchedules());
      }

      handleTabChange("builder");
    })
    .catch((err) => {
      console.error("Failed to create workflow in backend:", err);
      alert("Failed to create workflow: " + (err.message || err));
    });
  };

  const handleDuplicate = (id: string | number) => {
    apiClient.workflows.duplicate(id)
      .then(() => {
        fetchWorkflows();
      })
      .catch((err) => {
        console.error("Failed to duplicate workflow in backend:", err);
      });
  };

  const handleToggleWorkflowStatus = (id: string | number) => {
    apiClient.workflows.pause(id)
      .then(() => {
        fetchWorkflows();
      })
      .catch((err) => {
        console.error("Failed to pause/resume workflow in backend:", err);
      });
  };

  const handleDeleteWorkflow = (id: string | number) => {
    apiClient.workflows.delete(id)
      .then(() => {
        fetchWorkflows();
      })
      .catch((err) => {
        console.error("Failed to delete workflow in backend:", err);
      });
  };

  // Template import handler
  const handleImportTemplate = (id: string | number) => {
    apiClient.templates.use(id)
      .then((res) => {
        fetchWorkflows();
        setActiveWorkflowId(res.data.id);
        handleTabChange("builder");
      })
      .catch((err) => {
        console.error("Failed to import template:", err);
        alert("Failed to import template: " + (err.message || err));
      });
  };

  // Execution Handlers
  const handleRetryExecution = (id: number) => {
    apiClient.executions.retry(id)
      .then(() => {
        fetchExecutions();
      })
      .catch((err) => {
        console.error("Failed to retry execution in backend:", err);
      });
  };

  const handleCancelExecution = (id: number) => {
    setExecutions(prev => prev.map(e => e.id === id ? { ...e, status: "Failed" } : e));
  };

  // Schedule status modifiers
  const handleToggleSchedule = (id: string | number) => {
    const s = schedules.find(sched => sched.id === id);
    if (!s) return;

    apiClient.scheduler.update(id, {
      is_active: s.status !== "Active"
    })
    .then(() => {
      fetchSchedules();
    })
    .catch((err) => {
      console.error("Failed to update scheduler in backend:", err);
    });
  };

  const handleTriggerSchedule = (id: string | number) => {
    const job = schedules.find(s => s.id === id);
    if (job) {
      setExecutions(prev => [
        {
          id: Date.now() % 10000,
          workflowName: job.workflowName,
          status: "Success",
          started: "Just now",
          finished: "Just now",
          duration: "140ms",
          triggeredBy: "Scheduler rule"
        },
        ...prev
      ]);
    }
  };

  const handleDeleteSchedule = (id: string | number) => {
    apiClient.scheduler.delete(id)
      .then(() => {
        fetchSchedules();
      })
      .catch((err) => {
        console.error("Failed to delete schedule in backend:", err);
      });
  };

  // Variable modifiers
  const handleAddVariable = (variable: Omit<Variable, "id">) => {
    apiClient.variables.create({
      name: variable.key,
      value_type: variable.type,
      value: variable.defaultValue,
      scope: variable.scope,
      is_required: variable.required
    })
    .then(() => {
      fetchVariables();
    })
    .catch((err) => {
      console.error("Failed to create variable in backend:", err);
      alert("Failed to create variable: " + (err.message || err));
    });
  };

  const handleDeleteVariable = (id: string | number) => {
    apiClient.variables.delete(id)
      .then(() => {
        fetchVariables();
      })
      .catch((err) => {
        console.error("Failed to delete variable in backend:", err);
      });
  };

  // Webhook modifiers
  const handleToggleWebhook = (id: string | number) => {
    const w = webhooks.find(hook => hook.id === id);
    if (!w) return;

    apiClient.webhooks.update(id, {
      is_active: w.status !== "Active"
    })
    .then(() => {
      fetchWebhooks();
    })
    .catch((err) => {
      console.error("Failed to update webhook in backend:", err);
    });
  };

  const handleDeleteWebhook = (id: string | number) => {
    apiClient.webhooks.delete(id)
      .then(() => {
        fetchWebhooks();
      })
      .catch((err) => {
        console.error("Failed to delete webhook in backend:", err);
      });
  };

  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId) || workflows[0];

  return (
    <div className="max-w-[1920px] mx-auto w-full px-2">
      {/* Animated transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full"
        >
          {activeTab === "dashboard" && (
            <AutomationDashboard 
              workflows={workflows} 
              executions={executions} 
              templatesCount={templates.length}
              onTabChange={handleTabChange} 
              onOpenWizard={() => setIsWizardOpen(true)}
            />
          )}

          {activeTab === "workflows" && (
            <WorkflowList 
              workflows={workflows} 
              onSelectWorkflow={(id) => {
                setActiveWorkflowId(id);
                handleTabChange("builder");
              }}
              onDuplicate={handleDuplicate}
              onToggleStatus={handleToggleWorkflowStatus}
              onDelete={handleDeleteWorkflow}
              onOpenWizard={() => setIsWizardOpen(true)}
            />
          )}

          {activeTab === "builder" && (
            <WorkflowBuilder 
              workflowId={activeWorkflow?.id || ""}
              workflowName={activeWorkflow?.name || "New Workflow Pipeline"}
              onSave={(newName) => {
                setWorkflows(prev => prev.map(w => w.id === activeWorkflowId ? { ...w, name: newName } : w));
              }}
            />
          )}

          {activeTab === "templates" && (
            <TemplatesGallery 
              templates={templates} 
              onImportTemplate={handleImportTemplate} 
            />
          )}

          {activeTab === "executions" && (
            <ExecutionCenter 
              executions={executions} 
              onRetry={handleRetryExecution}
              onCancel={handleCancelExecution}
            />
          )}

          {activeTab === "scheduler" && (
            <CronScheduler 
              schedules={schedules} 
              onToggleStatus={handleToggleSchedule}
              onTriggerImmediate={handleTriggerSchedule}
              onDeleteSchedule={handleDeleteSchedule}
            />
          )}

          {activeTab === "variables" && (
            <VariableManager 
              variables={variables} 
              onAddVariable={handleAddVariable}
              onDeleteVariable={handleDeleteVariable}
            />
          )}

          {activeTab === "webhooks" && (
            <WebhooksManager 
              webhooks={webhooks} 
              onToggleWebhook={handleToggleWebhook}
              onDeleteWebhook={handleDeleteWebhook}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Workflow wizard modal */}
      <CreateWorkflowWizard 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreateWorkflow={handleCreateWorkflow}
      />
    </div>
  );
}
