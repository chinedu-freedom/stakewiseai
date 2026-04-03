"use client";
import * as React from "react";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

let memoryState = { toasts: [] };
const listeners = [];
const toastTimeouts = new Map();

function dispatch(action) {
  switch (action.type) {
    case "ADD_TOAST":
      memoryState = { ...memoryState, toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT) };
      break;
    case "UPDATE_TOAST":
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };
      break;
    case "DISMISS_TOAST":
      if (action.toastId) addToRemoveQueue(action.toastId);
      else memoryState.toasts.forEach((t) => addToRemoveQueue(t.id));
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.map((t) =>
          t.id === action.toastId || !action.toastId ? { ...t, open: false } : t
        ),
      };
      break;
    case "REMOVE_TOAST":
      if (!action.toastId) memoryState = { ...memoryState, toasts: [] };
      else memoryState = { ...memoryState, toasts: memoryState.toasts.filter((t) => t.id !== action.toastId) };
      break;
  }
  listeners.forEach((listener) => listener(memoryState));
}

function addToRemoveQueue(toastId) {
  if (toastTimeouts.has(toastId)) return;
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
}

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

function toast(props) {
  const id = props.id || genId();
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  const update = (props) => dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } });
  dispatch({
    type: "ADD_TOAST",
    toast: { ...props, id, open: true, onOpenChange: (open) => !open && dismiss() },
  });
  return { id, dismiss, update };
}

function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);
  return { ...state, toast, dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }) };
}

export { useToast, toast };
