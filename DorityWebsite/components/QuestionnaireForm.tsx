"use client";

import { useState, useEffect } from "react";
import { Questionnaire, QuestionnaireItem } from "@medplum/fhirtypes";
import { Loader2 } from "lucide-react";

interface QuestionnaireFormProps {
  questionnaireId: string;
  isEditable: boolean;
  onResponseChange?: (responses: Record<string, any>) => void;
  initialResponses?: Record<string, any>;
}

interface QuestionnaireItemRendererProps {
  item: QuestionnaireItem;
  isEditable: boolean;
  value: any;
  onChange: (linkId: string, value: any) => void;
  depth?: number;
}

function QuestionnaireItemRenderer({
  item,
  isEditable,
  value,
  onChange,
  depth = 0
}: QuestionnaireItemRendererProps) {
  const isRequired = item.required === true;
  const linkId = item.linkId || '';

  // Render based on item type
  const renderInput = () => {
    switch (item.type) {
      case 'string':
      case 'text':
        if (item.type === 'text') {
          return (
            <textarea
              value={value || ''}
              onChange={(e) => onChange(linkId, e.target.value)}
              disabled={!isEditable}
              className="w-full text-xs text-zinc-600 border border-zinc-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C2D3E]/20 focus:border-[#7C2D3E]/30 resize-none disabled:bg-zinc-50 disabled:text-zinc-500"
              rows={3}
              placeholder={item.text}
            />
          );
        }
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(linkId, e.target.value)}
            disabled={!isEditable}
            className="w-full text-xs text-zinc-600 border border-zinc-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C2D3E]/20 focus:border-[#7C2D3E]/30 disabled:bg-zinc-50 disabled:text-zinc-500"
            placeholder={item.text}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={linkId}
                checked={value === true}
                onChange={() => onChange(linkId, true)}
                disabled={!isEditable}
                className="text-[#7C2D3E] focus:ring-[#7C2D3E]/20"
              />
              <span className="text-xs text-zinc-700">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={linkId}
                checked={value === false}
                onChange={() => onChange(linkId, false)}
                disabled={!isEditable}
                className="text-[#7C2D3E] focus:ring-[#7C2D3E]/20"
              />
              <span className="text-xs text-zinc-700">No</span>
            </label>
          </div>
        );

      case 'choice':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(linkId, e.target.value)}
            disabled={!isEditable}
            className="w-full text-xs text-zinc-600 border border-zinc-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C2D3E]/20 focus:border-[#7C2D3E]/30 disabled:bg-zinc-50 disabled:text-zinc-500"
          >
            <option value="">Select an option...</option>
            {item.answerOption?.map((option, idx) => (
              <option 
                key={idx} 
                value={option.valueCoding?.code || option.valueString || idx}
              >
                {option.valueCoding?.display || option.valueString}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(linkId, e.target.value)}
            disabled={!isEditable}
            className="w-full text-xs text-zinc-600 border border-zinc-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C2D3E]/20 focus:border-[#7C2D3E]/30 disabled:bg-zinc-50 disabled:text-zinc-500"
          />
        );

      case 'integer':
      case 'decimal':
        return (
          <input
            type="number"
            step={item.type === 'decimal' ? '0.01' : '1'}
            value={value || ''}
            onChange={(e) => onChange(linkId, item.type === 'decimal' ? parseFloat(e.target.value) : parseInt(e.target.value))}
            disabled={!isEditable}
            className="w-full text-xs text-zinc-600 border border-zinc-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C2D3E]/20 focus:border-[#7C2D3E]/30 disabled:bg-zinc-50 disabled:text-zinc-500"
            placeholder={item.text}
          />
        );

      case 'display':
        return (
          <p className="text-xs text-zinc-600 italic">{item.text}</p>
        );

      case 'group':
        // Groups are handled separately
        return null;

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(linkId, e.target.value)}
            disabled={!isEditable}
            className="w-full text-xs text-zinc-600 border border-zinc-200 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#7C2D3E]/20 focus:border-[#7C2D3E]/30 disabled:bg-zinc-50 disabled:text-zinc-500"
            placeholder={item.text}
          />
        );
    }
  };

  // Handle group items differently
  if (item.type === 'group') {
    return (
      <div className={`space-y-3 ${depth > 0 ? 'ml-4 pl-4 border-l-2 border-zinc-200' : ''}`}>
        {item.text && (
          <h5 className="text-xs font-semibold text-zinc-800 mb-2">{item.text}</h5>
        )}
        {item.item?.map((subItem, idx) => (
          <QuestionnaireItemRenderer
            key={idx}
            item={subItem}
            isEditable={isEditable}
            value={value?.[subItem.linkId || idx]}
            onChange={onChange}
            depth={depth + 1}
          />
        ))}
      </div>
    );
  }

  // Handle display items
  if (item.type === 'display') {
    return (
      <div className="p-2.5 bg-blue-50/30 border border-blue-200/50 rounded-lg">
        <p className="text-xs text-blue-900">{item.text}</p>
      </div>
    );
  }

  // Regular question item
  return (
    <div className="p-2.5 bg-white border border-zinc-200/50 rounded-lg">
      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
        {item.text}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
    </div>
  );
}

export default function QuestionnaireForm({
  questionnaireId,
  isEditable,
  onResponseChange,
  initialResponses = {}
}: QuestionnaireFormProps) {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>(initialResponses);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuestionnaire() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/questionnaire/${questionnaireId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch questionnaire');
        }

        const data = await response.json();
        setQuestionnaire(data.questionnaire);
      } catch (err) {
        console.error('Error fetching questionnaire:', err);
        setError('Failed to load questionnaire form');
      } finally {
        setLoading(false);
      }
    }

    if (questionnaireId) {
      fetchQuestionnaire();
    }
  }, [questionnaireId]);

  const handleResponseChange = (linkId: string, value: any) => {
    const newResponses = { ...responses, [linkId]: value };
    setResponses(newResponses);
    onResponseChange?.(newResponses);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
        <span className="ml-2 text-xs text-zinc-500">Loading form...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-xs text-red-700">{error}</p>
      </div>
    );
  }

  if (!questionnaire || !questionnaire.item) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-700">No questions available for this form.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questionnaire.title && (
        <h4 className="text-sm font-semibold text-zinc-900">
          {questionnaire.title}
        </h4>
      )}
      {questionnaire.description && (
        <p className="text-xs text-zinc-600 italic">{questionnaire.description}</p>
      )}
      
      <div className="space-y-3">
        {questionnaire.item.map((item, idx) => (
          <QuestionnaireItemRenderer
            key={idx}
            item={item}
            isEditable={isEditable}
            value={responses[item.linkId || idx]}
            onChange={handleResponseChange}
          />
        ))}
      </div>
    </div>
  );
}
