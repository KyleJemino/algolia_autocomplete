import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import algoliasearch from 'algoliasearch/lite'
import { InstantSearch } from 'react-instantsearch-hooks-web'
import Autocomplete from '../components/Autocomplete'

const Home: NextPage = () => {
  const algoliaClient = algoliasearch(
    // process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    // process.env.NEXT_PUBLIC_ALGOLIA_API_KEY
    'latency',
    '6be0576ff61c053d5f9a3225e2a90f76'
  )

  const searchClient = {
    ...algoliaClient,
    // returns no result on empty query
    search: (requests) => {
      if (requests.every(({ params }) => !params.query)) {
        return Promise.resolve({
          results: requests.map(() => ({
            hits: [],
            nbHits: 0,
            nbPages: 0,
            page: 0,
            processingTimeMS: 0
          }))
        })
      }

      return algoliaClient.search(requests)
    }
  }

  return (
    <div className={styles.container}>
      <InstantSearch
        searchClient={searchClient}
        indexName={'instant_search'}
      >
        <Autocomplete
          placeholder='Search'
          detachedMediaQuery='none'
          openOnFocus
          searchClient={searchClient}
        />
      </InstantSearch>
    </div>
  )
}

export default Home
