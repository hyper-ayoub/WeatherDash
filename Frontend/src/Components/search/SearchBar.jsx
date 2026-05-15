import { useRef, useState } from "react";
import "./SearchBar.css";

export default function SearchBar({ regionName, onSelectSuggestion, placeholder, className = "" }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  const handleChange = (e) => setQuery(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (typeof onSelectSuggestion === "function" && query.trim().length > 0) {
        onSelectSuggestion({ searchLabel: query.trim(), displayLabel: query.trim() });
      }
    }
  };

  return (
    <div className={`wd-search-shell ${className}`.trim()}>
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
          onKeyDown={handleKeyDown}
          role="searchbox"
          aria-autocomplete="none"
        />
      </div>
    </div>
  );
}
