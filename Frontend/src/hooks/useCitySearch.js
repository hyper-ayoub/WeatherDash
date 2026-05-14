import { useCallback, useEffect, useRef, useState } from "react";
import { searchCitySuggestions } from "../services/openWeatherGeocodingService";

const DEFAULT_MIN_CHARACTERS = 2;
const DEFAULT_DEBOUNCE_MS = 300;

export default function useCitySearch({
  regionName,
  minCharacters = DEFAULT_MIN_CHARACTERS,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  onSelectSuggestion,
} = {}) {
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const requestTokenRef = useRef(0);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState("");

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= minCharacters;

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const handleHoverSuggestion = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  const handleSelectSuggestion = useCallback(
    (suggestion) => {
      if (!suggestion) {
        return;
      }

      setQuery(suggestion.displayLabel);
      closeDropdown();
      setError("");

      if (typeof onSelectSuggestion === "function") {
        void Promise.resolve(onSelectSuggestion(suggestion)).catch((selectionError) => {
          console.error("City selection failed:", selectionError);
        });
      }
    },
    [closeDropdown, onSelectSuggestion],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (!isOpen) {
        if (event.key === "ArrowDown" && suggestions.length > 0) {
          event.preventDefault();
          setIsOpen(true);
          setActiveIndex(0);
        }

        return;
      }

      if (!suggestions.length) {
        if (event.key === "Escape") {
          closeDropdown();
        }

        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((currentIndex) => (currentIndex + 1) % suggestions.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((currentIndex) => {
          if (currentIndex <= 0) {
            return suggestions.length - 1;
          }

          return currentIndex - 1;
        });
        return;
      }

      if (event.key === "Enter") {
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          event.preventDefault();
          handleSelectSuggestion(suggestions[activeIndex]);
        }
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeDropdown();
      }
    },
    [activeIndex, closeDropdown, handleSelectSuggestion, isOpen, suggestions],
  );

  const handleChange = useCallback((event) => {
    setQuery(event.target.value);
    setError("");
    setIsOpen(true);
  }, []);

  const handleFocus = useCallback(() => {
    if (canSearch && (suggestions.length > 0 || isLoading)) {
      setIsOpen(true);
    }
  }, [canSearch, isLoading, suggestions.length]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeDropdown]);

  useEffect(() => {
    if (!canSearch) {
      setSuggestions([]);
      setIsLoading(false);
      setError("");
      closeDropdown();
      return undefined;
    }

    const requestToken = requestTokenRef.current + 1;
    requestTokenRef.current = requestToken;
    const abortController = new AbortController();

    setIsLoading(true);
    setError("");

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await searchCitySuggestions(trimmedQuery, regionName, {
          signal: abortController.signal,
        });

        if (abortController.signal.aborted || requestTokenRef.current !== requestToken) {
          return;
        }

        setSuggestions(results);
        setIsOpen(true);
        setActiveIndex(results.length > 0 ? 0 : -1);
      } catch (searchError) {
        if (abortController.signal.aborted || requestTokenRef.current !== requestToken) {
          return;
        }

        setSuggestions([]);
        setActiveIndex(-1);
        setError(searchError.message || "Unable to load suggestions.");
        setIsOpen(true);
      } finally {
        if (!abortController.signal.aborted && requestTokenRef.current === requestToken) {
          setIsLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      abortController.abort();
      window.clearTimeout(timeoutId);
    };
  }, [canSearch, closeDropdown, debounceMs, regionName, trimmedQuery]);

  useEffect(() => {
    if (suggestions.length === 0) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex((currentIndex) => {
      if (currentIndex < 0) {
        return 0;
      }

      return Math.min(currentIndex, suggestions.length - 1);
    });
  }, [suggestions]);

  return {
    activeIndex,
    canSearch,
    closeDropdown,
    containerRef,
    error,
    handleChange,
    handleFocus,
    handleHoverSuggestion,
    handleKeyDown,
    handleSelectSuggestion,
    inputRef,
    isLoading,
    isOpen,
    query,
    suggestions,
    setQuery,
  };
}
