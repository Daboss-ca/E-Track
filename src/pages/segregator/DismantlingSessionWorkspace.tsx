import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Layers,
  AlertTriangle,
  Plus,
  Trash2,
  Calculator,
} from 'lucide-react';
import Button from '../../components/ui/Button/button';
import Badge from '../../components/ui/Badge/badge';
import { Modal } from '../../components/ui/Modal';
import type { 
  DismantlingSessionLog, 
  SegregationMode, 
  WorkOrder,
  ComponentClassification 
} from '../../types/segregator/segregator.types';
import { useDismantlingSessionWorkspace } from '../../hooks/segregator/useDismantlingSessionWorkspace';

export interface DismantlingSessionWorkspaceProps {
  workOrder: WorkOrder;
  mode: SegregationMode;
  selectedItemId: string;
  selectedItemName: string;
  onBack: () => void;
  onSubmitSession: (log: DismantlingSessionLog) => void;
}

export function DismantlingSessionWorkspace({
  workOrder,
  mode,
  selectedItemId,
  selectedItemName,
  onBack,
  onSubmitSession,
}: DismantlingSessionWorkspaceProps) {
  
  const {
    isRunning,
    setIsRunning,
    formattedTime,
    currentParts,
    activeModalPart,
    setActiveModalPart,
    checkedMainCards,
    checkedSubParts,
    handleSubPartToggle,
    handleFinishModalHazards,
    getBadgeColor,
    manualParts,
    newPartName,
    setNewPartName,
    newPartClass,
    setNewPartClass,
    newPartWeight,
    setNewPartWeight,
    handleAddManualPart,
    handleRemoveManualPart,
    itemWeight,
    setItemWeight,
    combinedTotalWeight,
    handleSubmit
  } = useDismantlingSessionWorkspace({ workOrder, mode, selectedItemId, selectedItemName, onSubmitSession });

  return (
    <div className="space-y-6 pb-12 relative">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" startIcon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>
            Back to Selection
          </Button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Cpu className="h-5 w-5 text-sky-500" />
              {selectedItemName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="text-center px-3">
            <span className="text-[10px] text-gray-400 block uppercase font-semibold">Session Time</span>
            <span className="font-mono text-xl font-bold text-gray-800 dark:text-gray-100">{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button size="sm" variant="primary" startIcon={<Play className="h-4 w-4" />} onClick={() => setIsRunning(true)}>
                Start
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30" startIcon={<Pause className="h-4 w-4" />} onClick={() => setIsRunning(false)}>
                Pause
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Component Parts
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentParts.map((part) => {
            const isChecked = !!checkedMainCards[part.id];
            return (
              <div
                key={part.id}
                onClick={() => { if (isRunning) setActiveModalPart(part); }}
                className={[
                  'flex flex-col justify-between rounded-xl border-2 p-4 transition-all relative overflow-hidden',
                  !isRunning ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800' : 'cursor-pointer hover:border-emerald-50 hover:shadow-md bg-white dark:bg-gray-800 dark:border-gray-700',
                  isChecked ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-500/10' : '',
                ].join(' ')}
              >
                {isChecked && (
                  <span className="absolute right-3 top-3 rounded-full bg-emerald-500 p-1 text-white shadow-sm z-10">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                )}
                <div>
                  <div className="relative h-48 w-full overflow-hidden rounded-lg mb-3 flex items-center justify-center">
                    <img src={part.imageUrl} alt={part.name} className="h-full w-full object-cover transition-transform hover:scale-105" />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-900 dark:text-white text-base">{part.name}</h4>
                    {isRunning && (
                      <span className="p-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900">
                        <Layers className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{part.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs font-medium">
                  <span className={isChecked ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-400'}>
                    {isChecked ? '✓ Checked / Extracted' : (isRunning ? 'Click to inspect parts' : 'Start session to unlock')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
            <Plus className="h-5 w-5 text-emerald-500" />
            Custom Parts & Session Output
          </h3>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
          <h4 className="text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Add Unlisted Part (Optional)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Part Name</label>
              <input type="text" placeholder="e.g., Custom Heatsink" value={newPartName} onChange={(e) => setNewPartName(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Classification</label>
              <select 
                value={newPartClass} 
                onChange={(e) => setNewPartClass(e.target.value as ComponentClassification)} 
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              >
                <option value="Recyclable">Recyclable</option>
                <option value="Reusable">Reusable</option>
                <option value="Hazardous">Hazardous</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Weight (kg)</label>
              <input type="number" step="0.01" placeholder="e.g., 0.45" value={newPartWeight} onChange={(e) => setNewPartWeight(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
            </div>
            <div>
              <Button variant="primary" className="w-full" onClick={handleAddManualPart} startIcon={<Plus className="h-4 w-4" />}>
                Add Part
              </Button>
            </div>
          </div>

          {manualParts.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <h5 className="text-[11px] font-bold uppercase text-gray-500 dark:text-gray-400">Added Custom Parts:</h5>
              <div className="flex flex-wrap gap-2">
                {manualParts.map((mp) => (
                  <div key={mp.id} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl shadow-sm">
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{mp.name}</span>
                    <Badge variant="light" size="sm" color={getBadgeColor(mp.classification)}>
                      {mp.classification} {mp.weight ? `(${mp.weight}kg)` : ''}
                    </Badge>
                    <button onClick={() => handleRemoveManualPart(mp.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Total E-Waste Weight (Kilograms)</label>
            <div className="relative">
              <input type="number" step="0.01" placeholder="e.g., 12.50" value={itemWeight} onChange={(e) => setItemWeight(e.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
              <span className="absolute right-4 top-2 text-sm font-semibold text-gray-400">kg</span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-1">Combined Total Weight</span>
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Base + Custom Parts</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-base font-bold text-gray-900 dark:text-white">{combinedTotalWeight.toFixed(2)}</span>
                <span className="text-xs font-semibold text-gray-500 ml-1">kg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button size="md" variant="primary" className="w-full sm:w-auto px-8 py-3 shadow-lg" onClick={handleSubmit} startIcon={<RefreshCw className="h-5 w-5" />}>
            Submit Completed Work
          </Button>
        </div>
      </div>

      <Modal isOpen={!!activeModalPart} onClose={() => setActiveModalPart(null)} className="max-w-4xl p-0 overflow-hidden" showCloseButton={false}>
        {activeModalPart && (
          <div className="flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inspection: {activeModalPart.name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto">
              <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="relative h-64 w-full flex items-center justify-center mb-3 overflow-hidden rounded-lg">
                  <img src={activeModalPart.imageUrl} alt={activeModalPart.name} className="h-full w-full object-cover" />
                </div>
                <div className="w-full text-left space-y-2 mt-2">
                  <Badge variant="light" size="md" color={getBadgeColor(activeModalPart.classification)}>Main Classification: {activeModalPart.classification}</Badge>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">{activeModalPart.description}</p>
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Hazardous Parts & Extraction Checklist</h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Check the extracted hazardous sub-parts below for compliance.</p>

                  <div className="space-y-3">
                    {activeModalPart.hazardousSubParts?.map((sub) => {
                      const isSubChecked = !!checkedSubParts[sub.id];
                      return (
                        <div key={sub.id} onClick={() => handleSubPartToggle(sub.id)} className={['cursor-pointer flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all', isSubChecked ? 'border-red-500 bg-red-50/40 dark:bg-red-950/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-red-300'].join(' ')}>
                          <input type="checkbox" checked={isSubChecked} onChange={() => {}} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-gray-900 dark:text-white">{sub.name}</span>
                              <Badge variant="light" size="sm" color="error">{sub.classification}</Badge>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setActiveModalPart(null)}>Cancel</Button>
                  <Button variant="primary" onClick={() => handleFinishModalHazards(activeModalPart)}>Done</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}