import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export enum KeysType {
    SPACE = " ",
    ENTER = "Enter",
    Z = "z",
}

type KeyboardHandler = (e: KeyboardEvent) => void;

interface KeyboardContextProps {
    registerHandler: (key: KeysType, handler: KeyboardHandler) => void;
    unRegisterHandler: (key: KeysType) => void;
}

export const KeyboardContext = createContext({} as KeyboardContextProps);

export function Keyboard({ children }: { children: React.ReactNode }) {
    const [handlers, setHandler] = useState<
        Record<KeysType, KeyboardHandler | null>
    >({
        [KeysType.SPACE]: null,
        [KeysType.ENTER]: null,
        [KeysType.Z]: null,
    });

    const registerHandler = useCallback(
        (key: KeysType, handler: KeyboardHandler) => {
            const existingHandler = handlers[key];
            if (existingHandler !== null) {
                throw new Error(`Handler already exist for key: ${key}`);
            }

            setHandler((handlers) => ({ ...handlers, [key]: handler }));
        },
        []
    );

    const unRegisterHandler = useCallback((key: KeysType) => {
        setHandler((handlers) => ({ ...handlers, [key]: null }));
    }, []);

    const latestHandlersRef = useRef<Record<KeysType, KeyboardHandler | null>>();
    latestHandlersRef.current = handlers;

    function handleKeyDown(e: KeyboardEvent) {
        if (latestHandlersRef.current) {
            const handler = latestHandlersRef.current[e.key as KeysType];
            if (handler) {
                handler.call(null, e);
            }
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <KeyboardContext.Provider value={{ registerHandler, unRegisterHandler }}>
            { children }
        </KeyboardContext.Provider>
	);
}

export function useKeyboard(key: KeysType, handler: KeyboardHandler) {
    const { registerHandler, unRegisterHandler } = useContext(KeyboardContext);

    useEffect(() => {
        registerHandler(key, handler);
        return () => unRegisterHandler(key);
    }, []);
}