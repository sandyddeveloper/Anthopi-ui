"use client";
import React, { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Save, 
  Zap, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Share2, 
  Bot, 
  Sliders, 
  Terminal, 
  Plus, 
  X,
  FileCode,
  Users,
  Briefcase,
  Layers,
  ArrowRight,
  Database,
  Mail,
  Copy,
  Trash2,
  Minimize2,
  Maximize2,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface Node {
  id: string;
  label: string;
  type: "trigger" | "ai" | "condition" | "action";
  status: "idle" | "running" | "success" | "failed";
  details: string;
  x: number;
  y: number;
  config: {
    name: string;
    description: string;
    prompt?: string;
    temperature?: number;
    agent?: string;
    url?: string;
    method?: string;
    sql?: string;
    expression?: string;
    filters?: string;
  };
}

interface Connection {
  from: string;
  to: string;
}

interface WorkflowBuilderProps {
  workflowId: string | number;
  workflowName: string;
  onSave: (name: string, nodes: Node[], connections: Connection[]) => void;
}

export function WorkflowBuilder({ workflowId, workflowName, onSave }: WorkflowBuilderProps) {
  // Global canvas settings
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [name, setName] = useState(workflowName);
  
  // Canvas State Nodes and Wires
  const [nodes, setNodes] = useState<Node[]>([]);

  const [connections, setConnections] = useState<Connection[]>([]);

  // Selected Node context inspector
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Interaction dragging states
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Connection line drawing
  const [connectionStartNode, setConnectionStartNode] = useState<string | null>(null);
  const [connectionMousePos, setConnectionMousePos] = useState({ x: 0, y: 0 });

  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  useEffect(() => {
    if (!workflowId || String(workflowId).length < 5) return;
    setIsLoadingDraft(true);
    apiClient.workflowBuilder.getDraft(workflowId)
      .then((res) => {
        const draft = res.data;
        if (draft && draft.nodes) {
          const sqlIdToClientNodeIdMap: Record<number, string> = {};
          const mappedNodes = draft.nodes.map((n: any) => {
            sqlIdToClientNodeIdMap[n.id] = n.node_id;
            return {
              id: n.node_id,
              label: n.name,
              type: n.node_type as any,
              status: "idle" as const,
              details: n.sub_type || "",
              x: n.position?.position_x || 100,
              y: n.position?.position_y || 200,
              config: n.configuration || {}
            };
          });

          const mappedConnections = draft.connections.map((c: any) => ({
            from: sqlIdToClientNodeIdMap[c.source_node] || c.source_node,
            to: sqlIdToClientNodeIdMap[c.target_node] || c.target_node
          }));

          setNodes(mappedNodes);
          setConnections(mappedConnections);
          if (draft.workflow_name) {
            setName(draft.workflow_name);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load workflow draft:", err);
      })
      .finally(() => {
        setIsLoadingDraft(false);
      });
  }, [workflowId]);

  // Debug simulation panel
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [debugDrawerOpen, setDebugDrawerOpen] = useState(false);

  // Undo/Redo queues
  const [history, setHistory] = useState<Array<{ nodes: Node[]; connections: Connection[] }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Push state changes to undo history
  const pushToHistory = (newNodes: Node[], newConnections: Connection[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    setHistory([...updatedHistory, { nodes: newNodes, connections: newConnections }]);
    setHistoryIndex(updatedHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setNodes(prev.nodes);
      setConnections(prev.connections);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setNodes(next.nodes);
      setConnections(next.connections);
      setHistoryIndex(historyIndex + 1);
    }
  };

  useEffect(() => {
    // Initial history push
    setHistory([{ nodes, connections }]);
    setHistoryIndex(0);
  }, []);

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      // Calculate where cursor is relative to node top-left
      const clientX = e.clientX;
      const clientY = e.clientY;
      const scale = zoom / 100;
      setDragOffset({
        x: clientX - node.x * scale,
        y: clientY - node.y * scale
      });
    }
  };

  // Canvas Panning Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Check if background click
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains("bg-workspace-grid")) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y
      });
      setSelectedNodeId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const scale = zoom / 100;

    if (draggingNodeId) {
      setNodes(prev => {
        const updated = prev.map(node => {
          if (node.id === draggingNodeId) {
            let newX = (e.clientX - dragOffset.x) / scale;
            let newY = (e.clientY - dragOffset.y) / scale;
            if (snapToGrid) {
              newX = Math.round(newX / 20) * 20;
              newY = Math.round(newY / 20) * 20;
            }
            return { ...node, x: newX, y: newY };
          }
          return node;
        });
        return updated;
      });
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (connectionStartNode) {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setConnectionMousePos({
          x: (e.clientX - rect.left - pan.x) / scale,
          y: (e.clientY - rect.top - pan.y) / scale
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (draggingNodeId) {
      pushToHistory(nodes, connections);
      setDraggingNodeId(null);
    }
    setIsPanning(false);
    setConnectionStartNode(null);
  };

  // Port connection click handlers
  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectionStartNode(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node && canvasRef.current) {
      setConnectionMousePos({
        x: node.x + 160, // approximate output port coordinate relative to canvas
        y: node.y + 40
      });
    }
  };

  const handlePortMouseUp = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectionStartNode && connectionStartNode !== nodeId) {
      // Connect wires
      const connectionExists = connections.some(c => c.from === connectionStartNode && c.to === nodeId);
      if (!connectionExists) {
        const nextConnections = [...connections, { from: connectionStartNode, to: nodeId }];
        setConnections(nextConnections);
        pushToHistory(nodes, nextConnections);
      }
    }
    setConnectionStartNode(null);
  };

  // Add new nodes
  const addNodeToCanvas = (type: Node["type"], label: string, details: string, initialConfig: any) => {
    // Generate position slightly shifted from center
    const newId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      label,
      type,
      status: "idle",
      details,
      x: 100 - pan.x + (nodes.length * 30) % 200,
      y: 200 - pan.y + (nodes.length * 30) % 200,
      config: initialConfig
    };
    const nextNodes = [...nodes, newNode];
    setNodes(nextNodes);
    setSelectedNodeId(newId);
    pushToHistory(nextNodes, connections);
  };

  const deleteSelectedNode = () => {
    if (selectedNodeId) {
      const nextNodes = nodes.filter(n => n.id !== selectedNodeId);
      const nextConnections = connections.filter(c => c.from !== selectedNodeId && c.to !== selectedNodeId);
      setNodes(nextNodes);
      setConnections(nextConnections);
      setSelectedNodeId(null);
      pushToHistory(nextNodes, nextConnections);
    }
  };

  // Save changes callback
  const handleSave = () => {
    onSave(name, nodes, connections);
    if (!workflowId || String(workflowId).length < 5) {
      alert("Workflow draft saved locally.");
      return;
    }

    const payloadNodes = nodes.map(n => ({
      node_id: n.id,
      name: n.label,
      node_type: n.type,
      sub_type: n.details,
      configuration: n.config,
      position: {
        position_x: n.x,
        position_y: n.y
      }
    }));

    const payloadConnections = connections.map(c => ({
      source_node: c.from,
      target_node: c.to,
      condition: {}
    }));

    apiClient.workflows.update(workflowId, { name })
      .then(() => {
        return apiClient.workflowBuilder.saveDraft({
          workflow_id: workflowId,
          nodes: payloadNodes,
          connections: payloadConnections
        });
      })
      .then(() => {
        return apiClient.workflows.publish(workflowId);
      })
      .then(() => {
        alert("Workflow draft saved and published successfully to the backend!");
      })
      .catch((err) => {
        console.error("Failed to save and publish draft:", err);
        alert(`Failed to save workflow draft: ${err.message || err}`);
      });
  };

  // Run sequential simulation test
  const runTestExecution = () => {
    if (isDebugging) return;
    setIsDebugging(true);
    setDebugDrawerOpen(true);
    setDebugLogs(["[INIT] Fetching pipeline structure...", `[READY] Compiling connections sequence for: ${name}`]);

    setNodes(prev => prev.map(n => ({ ...n, status: "idle" })));

    let step = 0;
    const runStep = () => {
      if (step < nodes.length) {
        const activeNode = nodes[step];
        setNodes(prev => prev.map((n, idx) => idx === step ? { ...n, status: "running" } : n));
        setDebugLogs(prev => [...prev, `[RUN] Processing node: ${activeNode.label} (${activeNode.type})`]);

        setTimeout(() => {
          setNodes(prev => prev.map((n, idx) => idx === step ? { ...n, status: "success" } : n));
          setDebugLogs(prev => [...prev, `[SUCCESS] Output matches. Node completed: ${activeNode.label} in 120ms.`]);
          step++;
          runStep();
        }, 750);
      } else {
        setIsDebugging(false);
        setDebugLogs(prev => [...prev, "[COMPLETE] Workflow run cycle finished successfully. Standard output: 200 OK."]);
      }
    };

    setTimeout(runStep, 300);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Bezier curve calculations for connections
  const getBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const controlPointOffset = Math.abs(x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + controlPointOffset} ${y1}, ${x2 - controlPointOffset} ${y2}, ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col h-[75vh] min-h-[500px] bg-card-bg border border-border-color rounded-card overflow-hidden text-xs relative select-none animate-fadeIn">
      {/* Top Toolbar panel */}
      <div className="h-14 border-b border-border-color bg-[#16181D]/40 px-4 flex items-center justify-between gap-3 flex-shrink-0 z-10">
        {/* Left Toolbar Info */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-[#8D96A7]/30 focus:border-primary focus:outline-none font-bold text-white text-xs px-1 py-0.5 w-44 transition-all"
          />
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold">
            Draft v1.2
          </span>
        </div>

        {/* Undo/Redo & Zoom controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 border-r border-border-color/60 pr-4">
            <button 
              onClick={handleUndo} 
              disabled={historyIndex <= 0}
              className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7] hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7] hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setZoom(z => Math.max(z - 10, 50))} className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7] cursor-pointer">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="font-mono text-[9px] text-[#8D96A7] w-8 text-center">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(z + 10, 150))} className="p-1.5 rounded hover:bg-hover-bg text-[#8D96A7] cursor-pointer">
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={runTestExecution}
            disabled={isDebugging}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:opacity-95 text-white shadow-md disabled:opacity-50 transition-all cursor-pointer text-white-force"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Test run</span>
          </button>
          <button 
            onClick={handleSave}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white shadow-md transition-all cursor-pointer text-white-force"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Publish Flow</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Drag & Drop Node Library */}
        <div className="w-56 bg-[#15171C]/90 border-r border-border-color overflow-y-auto scrollbar-thin p-4 flex flex-col gap-5 text-left flex-shrink-0">
          <div>
            <h4 className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider mb-2">Triggers</h4>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Webhook Trigger", details: "POST API call", icon: <Zap className="h-4 w-4 text-emerald-500" />, config: { name: "Webhook", description: "POST webhook payload callback URL", url: "https://api.nextbin.sbs/webhook" } },
                { label: "Schedule Trigger", details: "Cron timed intervals", icon: <Clock className="h-4 w-4 text-cyan-400" />, config: { name: "Scheduler", description: "Trigger on cron pattern rule", expression: "0 * * * *" } }
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => addNodeToCanvas("trigger", btn.label, btn.details, btn.config)}
                  className="w-full p-2 rounded-xl bg-[#16181D]/30 border border-border-color/60 hover:border-primary/20 hover:bg-[#16181D] text-left transition-all flex items-center gap-2 cursor-pointer"
                >
                  <div className="p-1 rounded-md bg-[#16181D] border border-border-color/60">{btn.icon}</div>
                  <div>
                    <h5 className="font-bold text-white text-[10px]">{btn.label}</h5>
                    <span className="text-[8px] text-[#8D96A7]">{btn.details}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider mb-2">AI Reasoning</h4>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Developer AI", details: "Reasoning and dev loops", icon: <Bot className="h-4 w-4 text-amber-500" />, config: { name: "Dev AI", description: "Generate development instructions", prompt: "Write clear test cases for...", temperature: 0.1, agent: "Developer AI" } },
                { label: "Marketing AI", details: "Copywriting, tags, assets", icon: <Bot className="h-4 w-4 text-rose-500" />, config: { name: "Marketing AI", description: "Auto tagline generation", prompt: "Generate 5 marketing options for...", temperature: 0.7, agent: "Marketing AI" } }
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => addNodeToCanvas("ai", btn.label, btn.details, btn.config)}
                  className="w-full p-2 rounded-xl bg-[#16181D]/30 border border-border-color/60 hover:border-primary/20 hover:bg-[#16181D] text-left transition-all flex items-center gap-2 cursor-pointer"
                >
                  <div className="p-1 rounded-md bg-[#16181D] border border-border-color/60">{btn.icon}</div>
                  <div>
                    <h5 className="font-bold text-white text-[10px]">{btn.label}</h5>
                    <span className="text-[8px] text-[#8D96A7]">{btn.details}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[#8D96A7] uppercase tracking-wider mb-2">Actions</h4>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Call API Endpoint", details: "JSON REST payload", icon: <Database className="h-4 w-4 text-primary" />, config: { name: "Call REST API", description: "HTTP Endpoint dispatch", url: "https://api.example.com/v1", method: "POST" } },
                { label: "Slack Broadcast", details: "Send message block", icon: <Mail className="h-4 w-4 text-[#8B5CF6]" />, config: { name: "Slack alert", description: "Post payload summary to channel", url: "https://slack.com/hooks" } }
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => addNodeToCanvas("action", btn.label, btn.details, btn.config)}
                  className="w-full p-2 rounded-xl bg-[#16181D]/30 border border-border-color/60 hover:border-primary/20 hover:bg-[#16181D] text-left transition-all flex items-center gap-2 cursor-pointer"
                >
                  <div className="p-1 rounded-md bg-[#16181D] border border-border-color/60">{btn.icon}</div>
                  <div>
                    <h5 className="font-bold text-white text-[10px]">{btn.label}</h5>
                    <span className="text-[8px] text-[#8D96A7]">{btn.details}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Infinite Canvas Area */}
        <div 
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex-1 overflow-hidden relative bg-[#0E0F12] cursor-grab active:cursor-grabbing"
        >
          {/* Snap Grid background */}
          <div className="absolute inset-0 bg-workspace-grid opacity-[0.22] pointer-events-none" />

          {/* Interactive Scaled Canvas */}
          <div 
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
              transformOrigin: "top left"
            }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* SVG Wires Layer */}
            <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none">
              {/* Completed connections */}
              {connections.map((c, idx) => {
                const nodeFrom = nodes.find(n => n.id === c.from);
                const nodeTo = nodes.find(n => n.id === c.to);
                if (nodeFrom && nodeTo) {
                  // Port locations
                  const x1 = nodeFrom.x + 160;
                  const y1 = nodeFrom.y + 40;
                  const x2 = nodeTo.x;
                  const y2 = nodeTo.y + 40;
                  return (
                    <path
                      key={idx}
                      d={getBezierPath(x1, y1, x2, y2)}
                      fill="none"
                      stroke={selectedNodeId === nodeFrom.id || selectedNodeId === nodeTo.id ? "var(--primary)" : "var(--border-color)"}
                      strokeWidth="2.5"
                      className="pointer-events-auto cursor-pointer hover:stroke-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Delete connection wire
                        const nextWires = connections.filter((_, i) => i !== idx);
                        setConnections(nextWires);
                        pushToHistory(nodes, nextWires);
                      }}
                    />
                  );
                }
                return null;
              })}

              {/* Drawing temporary line */}
              {connectionStartNode && (() => {
                const node = nodes.find(n => n.id === connectionStartNode);
                if (node) {
                  const x1 = node.x + 160;
                  const y1 = node.y + 40;
                  return (
                    <path
                      d={getBezierPath(x1, y1, connectionMousePos.x, connectionMousePos.y)}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  );
                }
                return null;
              })()}
            </svg>

            {/* Nodes Layer */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  style={{ 
                    left: `${node.x}px`, 
                    top: `${node.y}px`,
                    position: "absolute"
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  className={cn(
                    "w-44 bg-[#15171C] border rounded-xl p-3.5 shadow-xl flex flex-col gap-2 pointer-events-auto transition-all relative group",
                    isSelected 
                      ? "border-primary ring-1 ring-primary/40 shadow-primary/10" 
                      : "border-border-color/80 hover:border-primary/20",
                    node.status === "running" && "border-primary ring-1 ring-primary/50 animate-pulse",
                    node.status === "success" && "border-emerald-500 shadow-emerald-500/10",
                    node.status === "failed" && "border-rose-500 shadow-rose-500/10 animate-bounce"
                  )}
                >
                  {/* Handle Inputs (Left) */}
                  {node.type !== "trigger" && (
                    <div 
                      onMouseUp={(e) => handlePortMouseUp(e, node.id)}
                      className="absolute left-[-6px] top-1/2 -translate-y-1/2 h-3 w-3 bg-[#15171C] border-2 border-border-color rounded-full cursor-crosshair hover:bg-primary hover:border-primary transition-all z-20 pointer-events-auto"
                      title="Input Handle"
                    />
                  )}

                  {/* Node Type Identifier Badge */}
                  <div className="flex items-center justify-between border-b border-border-color/60 pb-1.5">
                    <span className={cn(
                      "text-[8px] uppercase font-extrabold px-1.5 py-0.5 rounded border inline-block",
                      node.type === "trigger" && "bg-primary/10 text-primary border-primary/20",
                      node.type === "ai" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                      node.type === "condition" && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                      node.type === "action" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    )}>
                      {node.type}
                    </span>
                    {node.status === "running" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                    {node.status === "success" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    )}
                    {node.status === "failed" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    )}
                  </div>

                  <h5 className="font-bold text-white text-[10px] text-left truncate">{node.label}</h5>
                  <span className="text-[9px] text-[#8D96A7] truncate text-left font-mono">{node.details}</span>

                  {/* Handle Outputs (Right) */}
                  <div 
                    onMouseDown={(e) => handlePortMouseDown(e, node.id)}
                    className="absolute right-[-6px] top-1/2 -translate-y-1/2 h-3 w-3 bg-[#15171C] border-2 border-border-color rounded-full cursor-crosshair hover:bg-primary hover:border-primary transition-all z-20 pointer-events-auto"
                    title="Drag to connect"
                  />
                </div>
              );
            })}
          </div>

          {/* Canvas mini map overlay */}
          <div className="absolute right-4 bottom-4 bg-[#15171C] border border-border-color rounded-xl p-2.5 shadow-2xl flex flex-col gap-2 w-32 pointer-events-auto">
            <span className="font-bold text-[#8D96A7] text-[8px] uppercase tracking-wider text-left">Mini Map</span>
            <div className="h-16 bg-[#0E0F12] rounded-lg border border-border-color/60 relative overflow-hidden">
              {nodes.map(n => (
                <div 
                  key={n.id}
                  style={{
                    left: `${(n.x / 1000) * 100}%`,
                    top: `${(n.y / 1000) * 100}%`,
                    position: "absolute"
                  }}
                  className="h-1.5 w-3 bg-[#8D96A7] rounded-sm"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Selected Node Inspector Panel */}
        <div className="w-64 bg-[#15171C]/90 border-l border-border-color overflow-y-auto scrollbar-thin p-4 flex flex-col justify-between text-left flex-shrink-0 z-10">
          {selectedNode ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border-color/60 pb-2.5 mb-1">
                <h4 className="font-bold text-white uppercase text-[10px] tracking-wider">Properties</h4>
                <button 
                  onClick={deleteSelectedNode}
                  className="p-1 rounded hover:bg-rose-500/10 text-[#8D96A7] hover:text-rose-500 transition-colors cursor-pointer"
                  title="Delete Node"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Node Basic Info */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#8D96A7]">Node Name</label>
                  <input
                    type="text"
                    value={selectedNode.config.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, label: val, config: { ...n.config, name: val } } : n));
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border-color bg-[#16181D]/60 text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#8D96A7]">Description</label>
                  <textarea
                    value={selectedNode.config.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, description: val } } : n));
                    }}
                    rows={2}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border-color bg-[#16181D]/60 text-white focus:outline-none resize-none"
                  />
                </div>

                {/* Conditional fields based on type */}
                {selectedNode.type === "ai" && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#8D96A7]">AI Agent Persona</label>
                      <select
                        value={selectedNode.config.agent}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, details: `Agent: ${val}`, config: { ...n.config, agent: val } } : n));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border-color bg-card-bg text-white outline-none cursor-pointer"
                      >
                        <option value="Developer AI">Developer AI</option>
                        <option value="Marketing AI">Marketing AI</option>
                        <option value="HR AI">HR AI</option>
                        <option value="Project AI">Project AI</option>
                        <option value="General AI">General AI</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#8D96A7]">AI Prompt</label>
                      <textarea
                        value={selectedNode.config.prompt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, prompt: val } } : n));
                        }}
                        rows={3}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border-color bg-[#16181D]/60 text-white focus:outline-none resize-none font-mono text-[10px]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#8D96A7]">Temperature</label>
                        <span className="font-mono text-[9px] text-[#B7BDC8]">{selectedNode.config.temperature}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedNode.config.temperature || 0.5}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, temperature: val } } : n));
                        }}
                        className="accent-primary w-full h-1 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {selectedNode.type === "trigger" && (
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#8D96A7]">Filters & Logic</label>
                    <input
                      type="text"
                      value={selectedNode.config.filters || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, filters: val } } : n));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border-color bg-[#16181D]/60 text-white focus:outline-none font-mono text-[10px]"
                    />
                  </div>
                )}

                {selectedNode.type === "condition" && (
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#8D96A7]">Branch Expression</label>
                    <input
                      type="text"
                      value={selectedNode.config.expression || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, details: `If ${val}`, config: { ...n.config, expression: val } } : n));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border-color bg-[#16181D]/60 text-white focus:outline-none font-mono text-[10px]"
                    />
                  </div>
                )}

                {selectedNode.type === "action" && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#8D96A7]">Request URL</label>
                      <input
                        type="text"
                        value={selectedNode.config.url || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, url: val } } : n));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border-color bg-[#16181D]/60 text-white focus:outline-none font-mono text-[10px]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#8D96A7]">HTTP Method</label>
                      <select
                        value={selectedNode.config.method || "POST"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, method: val } } : n));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border-color bg-card-bg text-white outline-none cursor-pointer font-bold"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#8D96A7]">
              <Minimize2 className="h-8 w-8 mb-2 text-[#2C313C]" />
              <span>Select a node on the canvas layout to inspect properties parameters.</span>
            </div>
          )}

          {/* Quick tips */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-[9px] text-[#8D96A7] mt-6">
            💡 Drag connections from the right port handles to another node's input port to wire up pipelines.
          </div>
        </div>
      </div>

      {/* Bottom: Simulated debugger logs panel */}
      {debugDrawerOpen && (
        <div className="h-44 border-t border-border-color bg-black flex flex-col font-mono text-[9px] z-20 flex-shrink-0 animate-slideUp">
          <div className="h-8 border-b border-border-color/60 px-4 flex items-center justify-between text-[#8D96A7] flex-shrink-0 bg-[#16181D]/40">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="h-4 w-4" />
              <span>Debugger Console Output</span>
            </span>
            <div className="flex items-center gap-3">
              {isDebugging && <span className="animate-pulse text-primary font-bold">SIMULATION RUNNING...</span>}
              <button 
                onClick={() => setDebugDrawerOpen(false)}
                className="p-1 rounded hover:bg-hover-bg text-[#8D96A7] hover:text-white cursor-pointer"
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex-1 p-3 overflow-y-auto scrollbar-thin flex flex-col gap-1 text-[#B7BDC8] text-left">
            {debugLogs.length > 0 ? (
              debugLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-[#8D96A7]">&gt;</span>
                  <span>{log}</span>
                </div>
              ))
            ) : (
              <span className="text-[#8D96A7] italic">Ready. Click 'Test Run' to inspect step validation.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
