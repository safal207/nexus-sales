import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface FunnelElement {
  id: string;
  type: 'text' | 'button' | 'form' | 'image' | 'video' | 'heading' | 'subheading' | 'paragraph'; // 2025-09-29 - Claude Code: Added missing element types
  content: {
    text?: string;
    src?: string;
    alt?: string;
    placeholder?: string;
  };
  position: { x: number; y: number };
  size: { width: number; height: number };
  styles: Record<string, string>;
  settings: {
    required?: boolean;
    action?: string;
    redirect?: string;
  };
}

export interface FunnelStep {
  id: string;
  name: string;
  elements: FunnelElement[];
  settings: {
    backgroundColor?: string;
    backgroundImage?: string;
  };
}

export interface Funnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  settings: {
    theme: 'light' | 'dark';
    primaryColor: string;
  };
  analytics: {
    views: number;
    conversions: number;
    createdAt: Date;
  };
}

interface FunnelState {
  // Current funnel
  currentFunnel: Funnel | null;
  currentStep: string | null;

  // UI state
  selectedElement: string | null;
  isPreviewMode: boolean;
  zoom: number;

  // Actions
  createFunnel: (name: string) => void;
  loadFunnel: (id: string) => void;
  saveFunnel: () => void;

  addStep: (name: string) => void;
  updateStep: (stepId: string, updates: Partial<FunnelStep>) => void;
  deleteStep: (stepId: string) => void;
  setCurrentStep: (stepId: string) => void;

  addElement: (stepId: string, element: Omit<FunnelElement, 'id'>) => void;
  updateElement: (elementId: string, updates: Partial<FunnelElement>) => void;
  deleteElement: (elementId: string) => void;
  selectElement: (elementId: string | null) => void;

  setPreviewMode: (isPreview: boolean) => void;
  setZoom: (zoom: number) => void;

  // Analytics
  trackView: () => void;
  trackConversion: () => void;
}

export const useFunnelStore = create<FunnelState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentFunnel: null,
      currentStep: null,
      selectedElement: null,
      isPreviewMode: false,
      zoom: 1,

      // Funnel actions
      createFunnel: async (name: string) => {
        try {
          const response = await fetch('/api/funnels', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
          });

          const data = await response.json();

          if (data.success) {
            set({
              currentFunnel: data.funnel,
              currentStep: data.funnel.steps[0]?.id || null
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error creating funnel:', error);
          return false;
        }
      },

      loadFunnel: async (id: string) => {
        try {
          const response = await fetch(`/api/funnels?id=${id}`);
          const data = await response.json();

          if (data.funnel) {
            set({ currentFunnel: data.funnel });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error loading funnel:', error);
          return false;
        }
      },

      saveFunnel: async () => {
        const { currentFunnel } = get();
        if (!currentFunnel) return;

        try {
          const response = await fetch(`/api/funnels/${currentFunnel.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(currentFunnel),
          });

          const data = await response.json();
          if (data.success) {
            set({ currentFunnel: data.funnel });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error saving funnel:', error);
          return false;
        }
      },

      // Step actions
      addStep: (name: string) => {
        const { currentFunnel } = get();
        if (!currentFunnel) return;

        const newStep: FunnelStep = {
          id: `step_${Date.now()}`,
          name,
          elements: [],
          settings: {},
        };

        const updatedFunnel = {
          ...currentFunnel,
          steps: [...currentFunnel.steps, newStep],
        };

        set({
          currentFunnel: updatedFunnel,
          currentStep: newStep.id
        });
      },

      updateStep: (stepId: string, updates: Partial<FunnelStep>) => {
        const { currentFunnel } = get();
        if (!currentFunnel) return;

        const updatedSteps = currentFunnel.steps.map(step =>
          step.id === stepId ? { ...step, ...updates } : step
        );

        set({
          currentFunnel: { ...currentFunnel, steps: updatedSteps }
        });
      },

      deleteStep: (stepId: string) => {
        const { currentFunnel } = get();
        if (!currentFunnel) return;

        const updatedSteps = currentFunnel.steps.filter(step => step.id !== stepId);
        set({
          currentFunnel: { ...currentFunnel, steps: updatedSteps },
          currentStep: currentFunnel.steps.find(s => s.id !== stepId)?.id || null
        });
      },

      setCurrentStep: (stepId: string) => {
        set({ currentStep: stepId });
      },

      // Element actions
      addElement: (stepId: string, elementData: Omit<FunnelElement, 'id'>) => {
        const { currentFunnel } = get();
        if (!currentFunnel) return;

        const newElement: FunnelElement = {
          id: `element_${Date.now()}`,
          ...elementData,
        };

        const updatedSteps = currentFunnel.steps.map(step =>
          step.id === stepId
            ? { ...step, elements: [...step.elements, newElement] }
            : step
        );

        set({
          currentFunnel: { ...currentFunnel, steps: updatedSteps }
        });
      },

      updateElement: (elementId: string, updates: Partial<FunnelElement>) => {
        const { currentFunnel } = get();
        if (!currentFunnel) return;

        const updateStepElements = (steps: FunnelStep[]) =>
          steps.map(step => ({
            ...step,
            elements: step.elements.map(element =>
              element.id === elementId ? { ...element, ...updates } : element
            )
          }));

        set({
          currentFunnel: {
            ...currentFunnel,
            steps: updateStepElements(currentFunnel.steps)
          }
        });
      },

      deleteElement: (elementId: string) => {
        const { currentFunnel } = get();
        if (!currentFunnel) return;

        const updateStepElements = (steps: FunnelStep[]) =>
          steps.map(step => ({
            ...step,
            elements: step.elements.filter(element => element.id !== elementId)
          }));

        set({
          currentFunnel: {
            ...currentFunnel,
            steps: updateStepElements(currentFunnel.steps)
          },
          selectedElement: null
        });
      },

      selectElement: (elementId: string | null) => {
        set({ selectedElement: elementId });
      },

      // UI actions
      setPreviewMode: (isPreview: boolean) => {
        set({ isPreviewMode: isPreview });
      },

      setZoom: (zoom: number) => {
        set({ zoom: Math.max(0.1, Math.min(3, zoom)) });
      },

      // Analytics
      trackView: () => {
        const { currentFunnel } = get();
        if (currentFunnel) {
          set({
            currentFunnel: {
              ...currentFunnel,
              analytics: {
                ...currentFunnel.analytics,
                views: currentFunnel.analytics.views + 1
              }
            }
          });
        }
      },

      trackConversion: () => {
        const { currentFunnel } = get();
        if (currentFunnel) {
          set({
            currentFunnel: {
              ...currentFunnel,
              analytics: {
                ...currentFunnel.analytics,
                conversions: currentFunnel.analytics.conversions + 1
              }
            }
          });
        }
      },
    }),
    {
      name: 'funnel-store',
    }
  )
);
