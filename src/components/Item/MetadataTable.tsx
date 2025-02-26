import React from "react";

import { Item, PageData } from "../types";
import { c } from "../helpers";
import { MarkdownRenderer } from "../MarkdownRenderer";

export interface ItemMetadataProps {
  item: Item;
  isSettingsVisible: boolean;
  searchQuery?: string;
}

export function ItemMetadata({
  item,
  isSettingsVisible,
  searchQuery,
}: ItemMetadataProps) {
  if (isSettingsVisible || !item.metadata.fileMetadata) return null;

  return (
    <div className={c("item-metadata-wrapper")}>
      <MetadataTable
        metadata={item.metadata.fileMetadata}
        searchQuery={searchQuery}
      />
    </div>
  );
}

interface MetadataValueProps {
  data: PageData;
  searchQuery: string;
}

function MetadataValue({ data, searchQuery }: MetadataValueProps) {
  if (Array.isArray(data.value)) {
    return (
      <span className={c("meta-value")}>
        {data.value.map((v, i, arr) => {
          const str = `${v}`;
          const linkPath = typeof v === "object" && (v as any).path;
          const isMatch = str.toLocaleLowerCase().contains(searchQuery);

          return (
            <>
              {linkPath || data.containsMarkdown ? (
                <MarkdownRenderer
                  className="inline"
                  markdownString={linkPath ? `[[${linkPath}]]` : str}
                  searchQuery={searchQuery}
                />
              ) : isMatch ? (
                <span className="is-search-match">{str}</span>
              ) : (
                str
              )}
              {i < arr.length - 1 ? <span>{", "}</span> : ""}
            </>
          );
        })}
      </span>
    );
  }

  const str = `${data.value}`;
  const isMatch = str.toLocaleLowerCase().contains(searchQuery);
  const linkPath = typeof data.value === "object" && (data.value as any).path;

  return (
    <span
      className={`${c("meta-value")} ${
        isMatch && !data.containsMarkdown ? "is-search-match" : ""
      }`}
    >
      {data.containsMarkdown || !!linkPath ? (
        <MarkdownRenderer
          markdownString={linkPath ? `[[${linkPath}]]` : str}
          searchQuery={searchQuery}
        />
      ) : (
        str
      )}
    </span>
  );
}

export interface MetadataTableProps {
  metadata: { [k: string]: PageData } | null;
  searchQuery?: string;
}

export const MetadataTable = React.memo(function MetadataTable({
  metadata,
  searchQuery,
}: MetadataTableProps) {
  if (!metadata) return null;

  return (
    <table className={c("meta-table")}>
      <tbody>
        {Object.keys(metadata).map((k) => {
          const data = metadata[k];
          return (
            <tr key={k} className={c("meta-row")}>
              {!data.shouldHideLabel && (
                <td
                  className={`${c("meta-key")} ${
                    (data.label || k).toLocaleLowerCase().contains(searchQuery)
                      ? "is-search-match"
                      : ""
                  }`}
                  data-key={k}
                >
                  <span>{data.label || k}</span>
                </td>
              )}
              <td
                colSpan={data.shouldHideLabel ? 2 : 1}
                className={c("meta-value-wrapper")}
                data-value={
                  Array.isArray(data.value)
                    ? data.value.join(", ")
                    : `${data.value}`
                }
              >
                {k === "tags" ? (
                  (data.value as string[]).map((tag, i) => {
                    return (
                      <a
                        href={tag}
                        key={i}
                        className={`tag ${c("item-tag")} ${
                          tag.toLocaleLowerCase().contains(searchQuery)
                            ? "is-search-match"
                            : ""
                        }`}
                      >
                        <span>{tag[0]}</span>
                        {tag.slice(1)}
                      </a>
                    );
                  })
                ) : (
                  <MetadataValue data={data} searchQuery={searchQuery} />
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
});
