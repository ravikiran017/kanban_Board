import React from "react";

interface SearchbarProps {
  placeholder?: string;
  onSearchChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  width?: string | number;
  height?: string | number;
  showFilter?: boolean; // New prop for filter icon button
  onFilterClick?: () => void; // Callback for filter button click
  filterComponent?: React.ReactNode;
  customStyle?: React.CSSProperties;
}

const Searchbar: React.FC<SearchbarProps> = ({
  placeholder = "Search",
  onSearchChange,
  width = "100%", // Default width
  height = "60px", // Default height
  customStyle,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #BABABA",
        borderRadius: "9px",
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        padding: "0 10px",
        ...customStyle,
      }}
    >
      {/* Search Icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginRight: "10px" }}
      >
        <path
          d="M11.5008 21.0002C16.7475 21.0002 21.0008 16.7469 21.0008 11.5002C21.0008 6.25351 16.7475 2.00021 11.5008 2.00021C6.25412 2.00021 2.00082 6.25351 2.00082 11.5002C2.00082 16.7469 6.25412 21.0002 11.5008 21.0002Z"
          stroke="#163041"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22.0008 22.0002L20.0008 20.0002"
          stroke="#163041"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Input Field */}
      <input
        type="text"
        placeholder={placeholder}
        onChange={onSearchChange}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          fontSize: "30px",
          color: "#333",
        }}
        aria-label="search"
      />
    </div>
  );
};

export default Searchbar;
