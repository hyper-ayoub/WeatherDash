import { useId } from "react";
import useCitySearch from "../../hooks/useCitySearch";
import SearchSuggestions from "./SearchSuggestions";
import "./SearchBar.css";

export default function SearchBar({
  regionName,
  onSelectSuggestion,
  placeholder,
  className = "",
}) {
  const listId = useId();

  const {
    activeIndex,
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
  } = useCitySearch({
    regionName,
    onSelectSuggestion,
  });

  const activeDescendantId =
    isOpen && activeIndex >= 0 && suggestions[activeIndex]
      ? `${listId}-option-${activeIndex}`
      : undefined;

  return (
    <div ref={containerRef} className={`wd-search-shell ${className}`.trim()}>
      <div className="wd-search-input-wrap">
        <span className="material-symbols-outlined wd-search-icon" aria-hidden="true">
          search
        </span>
        <input
          ref={inputRef}
          className="wd-search-input"
          type="text"
          value={query}
          placeholder={placeholder || (regionName ? `Search in ${regionName}` : "Search for a city...")}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-activedescendant={activeDescendantId}
        />
      </div>

      <SearchSuggestions
        id={listId}
        activeIndex={activeIndex}
        error={error}
        isLoading={isLoading}
        isOpen={isOpen}
        onHoverSuggestion={handleHoverSuggestion}
        onSelectSuggestion={handleSelectSuggestion}
        query={query}
        regionName={regionName}
        suggestions={suggestions}
      />
    </div>
  );
}
