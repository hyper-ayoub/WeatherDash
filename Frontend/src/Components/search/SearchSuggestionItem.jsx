import { memo } from "react";

function SearchSuggestionItem({ suggestion, isActive, id, onClick, onMouseEnter }) {
  return (
    <li className="wd-search-suggestion-row" role="presentation">
      <button
        id={id}
        type="button"
        className={`wd-search-suggestion${isActive ? " is-active" : ""}`}
        role="option"
        aria-selected={isActive}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
      >
        <span className="wd-search-suggestion-main">
          <span className="wd-search-suggestion-city">{suggestion.name}</span>
          {suggestion.state ? (
            <span className="wd-search-suggestion-state">{suggestion.state}</span>
          ) : null}
        </span>
        <span className="wd-search-suggestion-country">{suggestion.country}</span>
      </button>
    </li>
  );
}

export default memo(SearchSuggestionItem);
