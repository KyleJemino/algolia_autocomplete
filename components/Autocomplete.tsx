import type { SearchClient } from "algoliasearch/lite";
import type { BaseItem } from "@algolia/autocomplete-core";
import type { AutocompleteOptions, Render } from "@algolia/autocomplete-js";

import {
  createElement,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { render } from "react-dom";

import {
  useHierarchicalMenu,
  usePagination,
  useSearchBox
} from "react-instantsearch-hooks-web";
import { autocomplete } from "@algolia/autocomplete-js";
import { createLocalStorageRecentSearchesPlugin } from "@algolia/autocomplete-plugin-recent-searches";
import { createQuerySuggestionsPlugin } from "@algolia/autocomplete-plugin-query-suggestions";

import "@algolia/autocomplete-theme-classic";

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
  searchClient: SearchClient;
  className?: string;
};

type SetInstantSearchUiStateOptions = {
  query: string;
};

const Autocomplete = ({
  searchClient,
  className,
  ...autocompleteProps
}: AutocompleteProps) => {
  const autocompleteContainer = useRef<HTMLDivElement>(null);

  const { query, refine: setQuery } = useSearchBox();
  // const { items: categories, refine: setCategory } = useHierarchicalMenu({
  //   attributes: INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES
  // });
  const { refine: setPage } = usePagination();

  const [instantSearchUiState, setInstantSearchUiState] = useState<
    SetInstantSearchUiStateOptions
  >({ query });

  useEffect(() => {
    setQuery(instantSearchUiState.query);
    setPage(0);
  }, [instantSearchUiState]);

  const plugins = useMemo(() => {
    const recentSearches = createLocalStorageRecentSearchesPlugin({
      key: "instantsearch",
      limit: 3,
      transformSource({ source }) {
        return {
          ...source,
          onSelect({ item }) {
            setInstantSearchUiState({
              query: item.label,
            });
          }
        };
      }
    });


    const querySuggestions = createQuerySuggestionsPlugin({
      searchClient,
      indexName: 'instant_search_demo_query_suggestions',
      getSearchParams() {
        return recentSearches.data!.getAlgoliaSearchParams({
          hitsPerPage: 6
        });
      },
      transformSource({ source }) {
        return {
          ...source,
          sourceId: "querySuggestionsPlugin",
          onSelect({ item }) {
            setInstantSearchUiState({
              query: item.query,
            });
          },
          getItems(params) {
            if (!params.state.query) {
              return [];
            }

            return source.getItems(params);
          },
          templates: {
            ...source.templates,
            header({ items }) {
                return <Fragment />;
            }
          }
        };
      }
    });

    return [recentSearches, querySuggestions];
  }, []);

  useEffect(() => {
    if (!autocompleteContainer.current) {
      return;
    }

    const autocompleteInstance = autocomplete({
      ...autocompleteProps,
      container: autocompleteContainer.current,
      initialState: { query },
      plugins,
      onReset() {
        setInstantSearchUiState({ query: "" });
      },
      onSubmit({ state }) {
        setInstantSearchUiState({ query: state.query });
      },
      onStateChange({ prevState, state }) {
        if (prevState.query !== state.query) {
          setInstantSearchUiState({
            query: state.query
          });
        }
      },
      renderer: { createElement, Fragment, render: render as Render }
    });

    return () => autocompleteInstance.destroy();
  }, [plugins]);

  return <div className={className} ref={autocompleteContainer} />;
}

export default Autocomplete
