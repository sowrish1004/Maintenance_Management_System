"use client";
import { DataCategory, Reading } from '@prisma/client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Lock, Loader2, Check, AlertCircle } from 'lucide-react';

const StyledSwitch = ({ checked, onChange, disabled }: { checked: boolean, onChange: (checked: boolean) => void, disabled?: boolean }) => {
  return (
    <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked} 
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-400"></div>
    </label>
  );
};

type ReadingRowProps = {
  inspectionId: string;
  category: DataCategory;
  reading?: Reading;
};

const InspectionReadingRow = ({
  inspectionId,
  category,
  reading,
}: ReadingRowProps) => {
  const { user } = useUser();
  const [numValue, setNumValue] = useState(reading?.numericalValue ?? '');
  const [boolValue, setBoolValue] = useState(reading?.booleanValue ?? false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const initialReadingExists = !!reading;

  const userRole = (user?.publicMetadata?.role as string)?.toLowerCase();
  const isLocked = initialReadingExists && userRole !== 'administrator';

  const handleSave = async () => {
    if (isLocked) return;

    setSaveState('saving');

    const dataToSave = {
      inspectionId,
      categoryId: category.id,
      numericalValue: category.type === 'NUMBER' ? Number(numValue) : null,
      booleanValue: category.type === 'ON_OFF' ? boolValue : null,
    };
    
    try {
      const response = await fetch('/api/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        if (response.status === 403) {
             alert("Only administrators can update existing readings.");
        }
        throw new Error('Failed to save');
      }
      
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);

    } catch (error) {
      console.error(error);
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  return (
    <div className={`flex items-center justify-between gap-4 p-4 ring-[1.5px] rounded-md transition-colors ${isLocked ? 'ring-gray-200 bg-gray-50/50' : 'ring-gray-300 bg-white'}`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
          {isLocked && <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />}
          <label className={`text-sm font-medium truncate ${isLocked ? 'text-gray-500' : 'text-gray-700'}`} title={category.name}>
            {category.name}
          </label>
      </div>

      <div className="flex-shrink-0">
        {category.type === 'NUMBER' && (
            <input
            type="number"
            step="any"
            value={numValue}
            onChange={(e) => {
                setNumValue(e.target.value);
                if (saveState !== 'idle') setSaveState('idle');
            }}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-32 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            disabled={saveState === 'saving' || isLocked}
            />
        )}

        {category.type === 'ON_OFF' && (
            <StyledSwitch 
            checked={boolValue}
            onChange={(checked) => {
                setBoolValue(checked);
                if (saveState !== 'idle') setSaveState('idle');
            }}
            disabled={saveState === 'saving' || isLocked}
            />
        )}
      </div>

      {!isLocked ? (
          <button 
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className={`p-2 px-3 rounded-md text-sm font-medium text-white min-w-[80px] flex items-center justify-center transition-all
                ${saveState === 'idle' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                ${saveState === 'saving' ? 'bg-gray-400 cursor-wait' : ''}
                ${saveState === 'saved' ? 'bg-green-600' : ''}
                ${saveState === 'error' ? 'bg-red-600' : ''}
            `}
          >
            {saveState === 'idle' && "Save"}
            {saveState === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
            {saveState === 'saved' && <Check className="h-4 w-4" />}
            {saveState === 'error' && <AlertCircle className="h-4 w-4" />}
          </button>
      ) : (
        <div className="min-w-[80px]" /> 
      )}
    </div>
  );
};

export default InspectionReadingRow;