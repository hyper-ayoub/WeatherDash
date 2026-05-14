import { memo } from "react";
import SearchSuggestionItem from "./SearchSuggestionItem";

function SearchSuggestions({
  activeIndex,
  error,
  id,
  isLoading,
  isOpen,
  onHoverSuggestion,
  onSelectSuggestion,
  query,
  regionName,
  suggestions,
}) {
  if (!isOpen || (!isLoading && !error && suggestions.length === 0 && query.trim().length < 2)) {
    return null;
  }

  return (
    <div className="wd-search-dropdown" id={id} role="listbox" aria-label="City suggestions">
      <div className="wd-search-dropdown-head">
        <span>Suggestions</span>
        <span>{regionName || "All regions"}</span>
      </div>

      {isLoading ? (
        <div className="wd-search-state" aria-live="polite">
          <span className="wd-search-spinner" aria-hidden="true" />
          Searching cities...
        </div>
      ) : error ? (
        <div className="wd-search-state wd-search-state-error" aria-live="polite">
          {error}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="wd-search-state" aria-live="polite">
          No cities found for “{query.trim()}”.
        </div>
      ) : (
        <ul className="wd-search-suggestion-list">
          {suggestions.map((suggestion, index) => (
            <SearchSuggestionItem
              key={suggestion.id}
              id={`${id}-option-${index}`}
              suggestion={suggestion}
              isActive={index === activeIndex}
              onMouseEnter={() => onHoverSuggestion(index)}
              onClick={() => onSelectSuggestion(suggestion)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(SearchSuggestions);
